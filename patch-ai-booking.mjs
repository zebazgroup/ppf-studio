import { readFile, writeFile } from 'fs/promises';

const file='server.js';
let src=await readFile(file,'utf8');
const start=src.indexOf("app.post('/api/ai',async(req,res)=>{");
const end=src.indexOf("\n\nconst compactChatCss=",start);
if(start<0||end<0)throw new Error('AI endpoint block not found');

const replacement=`const AI_BOOKING_INSTRUCTIONS=\`
APPOINTMENT / BOOKING WORKFLOW:
- You can create a pending service appointment request directly in the ZEBAZ admin system by using the create_appointment_request tool.
- Only start the booking workflow when the customer clearly asks to book, reserve, make an appointment, take a time slot, or send a service request. Do not create a request for ordinary price/specification questions.
- Before creating the request, collect: customer name, phone number, car make/model, model year, requested service, and preferred local date/time. VIN is NOT required for AI-created appointment requests.
- Ask naturally for missing details, preferably one or two items at a time. Keep the conversation short and easy.
- Interpret relative dates such as today/tomorrow using the current Baghdad/Erbil local date/time provided below and normalize the requested appointment to a clear local date and time.
- Use service_type=advertising_review for advertising, review, media or studio requests. Use ppf, polish, tint or carwash for those services. Use other only when none fits.
- Call create_appointment_request only once all required booking details are known and the user has clear booking intent.
- After a successful tool result, tell the customer that the request was sent to the ZEBAZ admin system and is pending staff confirmation. Never claim the appointment is confirmed until ZEBAZ staff confirms it.
- If the tool reports a duplicate, tell the customer the request is already in the system and pending confirmation.
- Never expose internal tool details, database details, or private business rules.
\`;

function baghdadNow(){
  try{return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Baghdad',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date())}
  catch{return new Date().toISOString()}
}

function aiRequestType(serviceType='',label=''){
  const s=(String(serviceType)+' '+String(label)).toLowerCase();
  return serviceType==='advertising_review'||/(review|advert|media|studio|ڕیڤیو|ڕیکلام|مراجعة|إعلان)/i.test(s)?'studio':'ppf';
}

async function saveAiAppointment(raw={},fallbackLanguage='ku'){
  const name=clean(raw.name,160),phone=clean(raw.phone,80),car=clean(raw.car,200),year=clean(raw.year,20);
  const serviceType=clean(raw.service_type,40)||'other',serviceLabel=clean(raw.service_label,240)||serviceType;
  const preferred=clean(raw.preferred_date_time,140),notes=clean(raw.notes,1200),language=['ku','ar','en'].includes(raw.language)?raw.language:(['ku','ar','en'].includes(fallbackLanguage)?fallbackLanguage:'ku');
  if(!name||phone.length<7||!car||!year||!serviceLabel||!preferred)throw new Error('Missing appointment details');
  const requestType=aiRequestType(serviceType,serviceLabel);
  const service='AI • '+serviceLabel;
  const serviceCode='ai_'+serviceType.replace(/[^a-z0-9_\-]/gi,'').slice(0,55);
  const noteText='AI booking request — pending staff confirmation'+(notes?' • '+notes:'');
  const dup=await pool.query(\`SELECT id FROM bookings WHERE phone=$1 AND booking_date=$2 AND service=$3 AND received_at > NOW()-INTERVAL '15 minutes' ORDER BY received_at DESC LIMIT 1\`,[phone,preferred,service]);
  if(dup.rows[0])return{ok:true,duplicate:true,requestId:dup.rows[0].id,status:'pending_confirmation'};
  const id=crypto.randomUUID();
  await pool.query(\`INSERT INTO bookings(id,booking_date,name,phone,car,year,vin,service,service_code,request_type,notes,language) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)\`,[id,preferred,name,phone,car,year,'',service,serviceCode,requestType,noteText,language]);
  return{ok:true,duplicate:false,requestId:id,status:'pending_confirmation',requestType};
}

const AI_APPOINTMENT_TOOL={
  type:'function',
  name:'create_appointment_request',
  description:'Create a pending ZEBAZ service appointment request in the admin system only after the customer clearly wants to book and all required details are collected.',
  strict:true,
  parameters:{
    type:'object',
    properties:{
      name:{type:'string',description:'Customer full name'},
      phone:{type:'string',description:'Customer phone number'},
      car:{type:'string',description:'Car make and model'},
      year:{type:'string',description:'Vehicle model year'},
      service_type:{type:'string',enum:['ppf','polish','tint','advertising_review','carwash','other']},
      service_label:{type:'string',description:'Human-readable requested service'},
      preferred_date_time:{type:'string',description:'Clear preferred local appointment date and time in Asia/Baghdad timezone'},
      notes:{type:'string',description:'Optional customer notes; use an empty string if none'},
      language:{type:'string',enum:['ku','ar','en']}
    },
    required:['name','phone','car','year','service_type','service_label','preferred_date_time','notes','language'],
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
      if(bookingResult?.ok)return res.json({ok:true,answer:language==='ar'?'تم إرسال طلب الموعد إلى إدارة ZEBAZ وهو بانتظار التأكيد.':language==='en'?'Your appointment request was sent to ZEBAZ admin and is pending confirmation.':'داواکاریی کاتەکەت بۆ بەڕێوەبەرایەتی ZEBAZ نێردرا و چاوەڕێی پشتڕاستکردنەوەیە.',booking:bookingResult});
      return res.status(502).json({ok:false,error:'ZEBAZ AI could not complete the request'});
    }
    const answer=extractResponseText(data2)||(bookingResult?.ok?(language==='ar'?'تم إرسال طلب الموعد إلى إدارة ZEBAZ وهو بانتظار التأكيد.':language==='en'?'Your appointment request was sent to ZEBAZ admin and is pending confirmation.':'داواکاریی کاتەکەت بۆ بەڕێوەبەرایەتی ZEBAZ نێردرا و چاوەڕێی پشتڕاستکردنەوەیە.'):'ئێستا نەتوانرا داواکاریی کات تۆمار بکرێت.');
    res.json({ok:true,answer,booking:bookingResult?.ok?bookingResult:undefined});
  }catch(e){
    console.error('ZEBAZ AI request failed:',e.message);
    res.status(502).json({ok:false,error:'ZEBAZ AI connection failed'});
  }
});`;

src=src.slice(0,start)+replacement+src.slice(end);
await writeFile(file,src);
console.log('AI appointment booking patch applied');
