import { readFile, writeFile } from 'fs/promises';

const file='server.js';
let src=await readFile(file,'utf8');
const start=src.indexOf("app.post('/api/ai',async(req,res)=>{");
const end=src.indexOf("\n\nconst compactChatCss=",start);
if(start<0||end<0)throw new Error('AI endpoint block not found');

const replacement=`const AI_BOOKING_INSTRUCTIONS=\`
ZEBAZ BOOKING / SERVICE REQUEST WORKFLOW:
- You can create a pending request for ANY ZEBAZ division by using create_appointment_request.
- Supported divisions and examples:
  1) ppf_studio: PPF, polish, window tint, detailing / car care.
  2) studio_media: car advertising, professional review, photography, videography, social-media content.
  3) carwash: car wash and car-care requests.
  4) fb_oil: FB Oil station-related service requests.
  5) game_center: Game Center reservations / service requests.
  6) general: any other ZEBAZ service that does not fit the above.
- Only start this workflow when the customer clearly asks to book, reserve, make an appointment, take a time slot, or send a service request. Do NOT create a request for ordinary price/specification/information questions.
- Always collect: customer name, phone number, requested service, and preferred local date/time.
- For automotive services (PPF, polish, tint, advertising/review, photography/video of a car, car wash/detailing), also collect car make/model and model year.
- For non-automotive requests (for example Game Center or a general FB Oil request), do not force the customer to provide a car; set car and year to N/A when calling the tool.
- VIN is NOT required for AI-created requests.
- If a branch/location matters, collect it naturally. For FB Oil, ask which branch if the customer has not made it clear. If no special location is needed, use an empty string.
- Ask naturally for missing details, preferably one or two items at a time. Keep the booking flow short and easy.
- Interpret relative dates such as today/tomorrow using the current Baghdad/Erbil local date/time below and normalize the preferred time clearly.
- Call create_appointment_request only once all required details are known and the user has clear booking intent.
- After a successful tool result, tell the customer the request was sent directly to the ZEBAZ admin system and is pending staff confirmation. Never claim a time is confirmed until staff confirms it.
- If the tool reports a duplicate, tell the customer the request is already in the system and pending confirmation.
- Never expose internal tool details, database details, private pricing rules, or internal service routing.
\`;

function baghdadNow(){
  try{return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Baghdad',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date())}
  catch{return new Date().toISOString()}
}

function aiRequestType(division='',serviceType='',label=''){
  const d=String(division||'').toLowerCase(),s=(String(serviceType)+' '+String(label)).toLowerCase();
  if(d==='studio_media'||/(review|advert|media|studio|photo|video|ڕیڤیو|ڕیکلام|مراجعة|إعلان)/i.test(s))return 'studio';
  if(d==='carwash'||/(carwash|car wash|wash|detail|شۆردن|غسيل)/i.test(s))return 'carwash';
  if(d==='fb_oil'||/(fb oil|fuel|oil station|بنزین|وقود)/i.test(s))return 'fb_oil';
  if(d==='game_center'||/(game|gaming|یاری|ألعاب)/i.test(s))return 'game_center';
  if(d==='ppf_studio'||/(ppf|polish|tint|film|پۆلیش|جام|تظليل)/i.test(s))return 'ppf';
  return 'general';
}

async function saveAiAppointment(raw={},fallbackLanguage='ku'){
  const name=clean(raw.name,160),phone=clean(raw.phone,80),car=clean(raw.car,200)||'N/A',year=clean(raw.year,20)||'N/A';
  const division=clean(raw.division,40)||'general',serviceType=clean(raw.service_type,50)||'other',serviceLabel=clean(raw.service_label,240)||serviceType;
  const preferred=clean(raw.preferred_date_time,140),location=clean(raw.location,240),notes=clean(raw.notes,1200),language=['ku','ar','en'].includes(raw.language)?raw.language:(['ku','ar','en'].includes(fallbackLanguage)?fallbackLanguage:'ku');
  if(!name||phone.length<7||!serviceLabel||!preferred)throw new Error('Missing appointment details');
  const requestType=aiRequestType(division,serviceType,serviceLabel);
  const service='AI • '+division+' • '+serviceLabel;
  const serviceCode=('ai_'+division+'_'+serviceType).replace(/[^a-z0-9_\-]/gi,'').slice(0,80);
  const noteParts=['AI booking request — pending staff confirmation'];
  if(location)noteParts.push('Location: '+location);
  if(notes)noteParts.push(notes);
  const noteText=noteParts.join(' • ');
  const dup=await pool.query(\`SELECT id FROM bookings WHERE phone=$1 AND booking_date=$2 AND service=$3 AND received_at > NOW()-INTERVAL '15 minutes' ORDER BY received_at DESC LIMIT 1\`,[phone,preferred,service]);
  if(dup.rows[0])return{ok:true,duplicate:true,requestId:dup.rows[0].id,status:'pending_confirmation',requestType,division};
  const id=crypto.randomUUID();
  await pool.query(\`INSERT INTO bookings(id,booking_date,name,phone,car,year,vin,service,service_code,request_type,notes,language) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)\`,[id,preferred,name,phone,car,year,'',service,serviceCode,requestType,noteText,language]);
  return{ok:true,duplicate:false,requestId:id,status:'pending_confirmation',requestType,division};
}

const AI_APPOINTMENT_TOOL={
  type:'function',
  name:'create_appointment_request',
  description:'Create a pending ZEBAZ appointment or service request in the admin system after the customer clearly wants to book and all required details are collected.',
  strict:true,
  parameters:{
    type:'object',
    properties:{
      name:{type:'string',description:'Customer full name'},
      phone:{type:'string',description:'Customer phone number'},
      division:{type:'string',enum:['ppf_studio','studio_media','carwash','fb_oil','game_center','general']},
      car:{type:'string',description:'Car make/model for automotive requests; N/A for non-automotive requests'},
      year:{type:'string',description:'Vehicle model year for automotive requests; N/A for non-automotive requests'},
      service_type:{type:'string',enum:['ppf','polish','tint','detailing','advertising_review','photography','videography','carwash','fb_oil_service','game_center','other']},
      service_label:{type:'string',description:'Human-readable requested service'},
      preferred_date_time:{type:'string',description:'Clear preferred local date and time in Asia/Baghdad timezone'},
      location:{type:'string',description:'Preferred branch/location when relevant; otherwise empty string'},
      notes:{type:'string',description:'Optional customer notes; use an empty string if none'},
      language:{type:'string',enum:['ku','ar','en']}
    },
    required:['name','phone','division','car','year','service_type','service_label','preferred_date_time','location','notes','language'],
    additionalProperties:false
  }
};

app.post('/api/ai',async(req,res)=>{
  if(!process.env.OPENAI_API_KEY)return res.status(503).json({ok:false,error:'AI engine is not configured'});
  if(!aiAllowed(req))return res.status(429).json({ok:false,error:'Too many requests. Please try again shortly.'});
  const message=clean(req.body?.message,1800),history=Array.isArray(req.body?.history)?req.body.history.slice(-8):[],language=clean(req.body?.language,10)||'ku';
  if(!message)return res.status(400).json({ok:false,error:'Message is required'});
  const input=[];
  for(const h of history){
    const role=h?.role==='assistant'?'assistant':'user',txt=clean(h?.content,1800);
    if(txt)input.push({role,content:[{type:role==='assistant'?'output_text':'input_text',text:txt}]});
  }
  input.push({role:'user',content:[{type:'input_text',text:message}]});
  const privateRules=clean(process.env.ZEBAZ_AI_BUSINESS_RULES||'',12000);
  const instructions=ZEBAZ_AI_INSTRUCTIONS+'\\n'+AI_BOOKING_INSTRUCTIONS+'\\nCURRENT BAGHDAD/ERBIL LOCAL DATE & TIME: '+baghdadNow()+(privateRules?'\\n\\nPRIVATE ZEBAZ COMMERCIAL RULES — INTERNAL ONLY:\\n'+privateRules:'');
  try{
    const first=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({model:'gpt-5.6-terra',instructions,input,tools:[{type:'web_search'},AI_APPOINTMENT_TOOL],tool_choice:'auto',max_output_tokens:1400})
    });
    const data=await first.json();
    if(!first.ok){
      console.error('OpenAI error:',first.status,data?.error?.type||data?.error?.code||'unknown');
      return res.status(502).json({ok:false,error:'ZEBAZ AI could not answer right now'});
    }
    const calls=(data.output||[]).filter(x=>x?.type==='function_call'&&x?.name==='create_appointment_request');
    if(!calls.length){
      const answer=extractResponseText(data);
      if(!answer)return res.status(502).json({ok:false,error:'No AI response received'});
      return res.json({ok:true,answer});
    }
    const outputs=[];let bookingResult=null;
    for(const call of calls.slice(0,1)){
      try{
        const args=JSON.parse(call.arguments||'{}');
        bookingResult=await saveAiAppointment(args,language);
        outputs.push({type:'function_call_output',call_id:call.call_id,output:JSON.stringify(bookingResult)});
      }catch(e){
        console.error('AI appointment save failed:',e.message);
        bookingResult={ok:false,error:'Could not save appointment request'};
        outputs.push({type:'function_call_output',call_id:call.call_id,output:JSON.stringify(bookingResult)});
      }
    }
    const second=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({model:'gpt-5.6-terra',previous_response_id:data.id,instructions,input:outputs,max_output_tokens:800})
    });
    const data2=await second.json();
    if(!second.ok){
      console.error('OpenAI follow-up error:',second.status,data2?.error?.type||data2?.error?.code||'unknown');
      if(bookingResult?.ok)return res.json({ok:true,answer:language==='ar'?'تم إرسال طلبك مباشرة إلى إدارة ZEBAZ وهو بانتظار التأكيد.':language==='en'?'Your request was sent directly to ZEBAZ admin and is pending confirmation.':'داواکارییەکەت ڕاستەوخۆ بۆ ئەدمینی ZEBAZ نێردرا و چاوەڕێی پشتڕاستکردنەوەیە.',booking:bookingResult});
      return res.status(502).json({ok:false,error:'ZEBAZ AI could not complete the request'});
    }
    const fallback=language==='ar'?'تم إرسال طلبك مباشرة إلى إدارة ZEBAZ وهو بانتظار التأكيد.':language==='en'?'Your request was sent directly to ZEBAZ admin and is pending confirmation.':'داواکارییەکەت ڕاستەوخۆ بۆ ئەدمینی ZEBAZ نێردرا و چاوەڕێی پشتڕاستکردنەوەیە.';
    const answer=extractResponseText(data2)||(bookingResult?.ok?fallback:'ئێستا نەتوانرا داواکارییەکەت تۆمار بکرێت.');
    res.json({ok:true,answer,booking:bookingResult?.ok?bookingResult:undefined});
  }catch(e){
    console.error('ZEBAZ AI request failed:',e.message);
    res.status(502).json({ok:false,error:'ZEBAZ AI connection failed'});
  }
});`;

src=src.slice(0,start)+replacement+src.slice(end);
await writeFile(file,src);
console.log('AI all-service booking patch applied');
