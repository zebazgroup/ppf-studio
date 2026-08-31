(()=>{
  if(!/^\/cars\/?$/.test(location.pathname))return;

  const CATALOG={
    'Acura':['Integra','TLX','RLX','ILX','MDX','RDX','ZDX','NSX'],
    'Alfa Romeo':['Giulia','Stelvio','Tonale','4C','Giulietta','MiTo'],
    'Aston Martin':['DBX','DB12','DB11','Vantage','Vanquish','Valkyrie','Rapide'],
    'Audi':['A1','A3','A4','A5','A6','A7','A8','Q2','Q3','Q4 e-tron','Q5','Q6 e-tron','Q7','Q8','e-tron GT','RS3','RS4','RS5','RS6','RS7','RS Q8','R8','S3','S4','S5','S6','S7','S8','SQ5','SQ7','SQ8'],
    'BAIC':['BJ20','BJ30','BJ40','BJ60','BJ80','EU5','U5 Plus','X35','X55','X7'],
    'Bentley':['Bentayga','Continental GT','Flying Spur','Mulsanne','Batur'],
    'BMW':['1 Series','2 Series','3 Series','4 Series','5 Series','6 Series','7 Series','8 Series','X1','X2','X3','X4','X5','X6','X7','XM','Z4','i3','i4','i5','i7','i8','iX','iX1','iX2','iX3','M2','M3','M4','M5','M8','X3 M','X4 M','X5 M','X6 M'],
    'Bugatti':['Chiron','Veyron','Divo','Mistral','Tourbillon','Centodieci'],
    'BYD':['Atto 3','Dolphin','Dolphin Mini','Han','Seal','Seal 5','Seal 6','Seal U','Song Plus','Song Pro','Qin Plus','Tang','Yuan Plus','Yuan Up','Destroyer 05','Frigate 07','Shark 6'],
    'Cadillac':['CT4','CT5','CT6','CTS','ATS','XTS','XT4','XT5','XT6','Escalade','Escalade ESV','Escalade IQ','Lyriq','Optiq','Celestiq'],
    'Changan':['Alsvin','CS15','CS35 Plus','CS55 Plus','CS75 Plus','CS85','CS95','Eado','UNI-K','UNI-T','UNI-V','Hunter','Deepal S7','Deepal SL03'],
    'Chery':['Arrizo 5','Arrizo 6','Arrizo 8','Tiggo 2','Tiggo 4','Tiggo 5','Tiggo 7','Tiggo 8','Tiggo 9','iCar 03'],
    'Chevrolet':['Aveo','Cruze','Malibu','Impala','Camaro','Corvette','Trax','Trailblazer','Equinox','Blazer','Traverse','Tahoe','Suburban','Captiva','Groove','Colorado','Silverado 1500','Silverado 2500HD','Silverado 3500HD'],
    'Chrysler':['200','300','Pacifica','Voyager','Town & Country'],
    'Citroen':['C3','C3 Aircross','C4','C4 X','C5 Aircross','Berlingo','C-Elysee'],
    'Cupra':['Formentor','Leon','Ateca','Born','Tavascan','Terramar'],
    'Daihatsu':['Mira','Move','Tanto','Rocky','Terios','Sirion','Gran Max'],
    'Denza':['D9','N7','N8','N9','Z9','Z9 GT'],
    'Dodge':['Charger','Challenger','Durango','Journey','Hornet','Dart','Ram 1500'],
    'Dongfeng':['Aeolus Yixuan','Aeolus Shine','Aeolus Huge','Forthing T5','Forthing Friday','Rich 6','M-Hero 917'],
    'Exeed':['LX','TXL','RX','VX','Exlantix ES','Exlantix ET'],
    'Fangchengbao':['Leopard 5','Leopard 8','Leopard 3','Titanium 3'],
    'Ferrari':['Roma','Portofino','296 GTB','296 GTS','SF90 Stradale','SF90 Spider','812 Superfast','812 GTS','Purosangue','F8 Tributo','LaFerrari'],
    'Fiat':['500','500X','500L','Panda','Tipo','Doblo','Fiorino'],
    'Ford':['Fiesta','Focus','Fusion','Taurus','Mustang','Mustang Mach-E','EcoSport','Escape','Edge','Explorer','Expedition','Bronco','Bronco Sport','Everest','Territory','Ranger','Maverick','F-150','F-150 Raptor','F-150 Lightning','Super Duty F-250','Super Duty F-350'],
    'GAC':['Empow','Emkoo','GS3','GS4','GS5','GS8','M8','Aion Y','Aion S','Aion LX'],
    'Geely':['Emgrand','Coolray','Azkarra','Monjaro','Okavango','Geometry C','Galaxy L7','Galaxy E5','Preface'],
    'Genesis':['G70','G80','G90','GV60','GV70','GV80','GV80 Coupe'],
    'GMC':['Terrain','Acadia','Yukon','Yukon XL','Canyon','Sierra 1500','Sierra 2500HD','Sierra 3500HD','Hummer EV Pickup','Hummer EV SUV'],
    'Great Wall':['Wingle 5','Wingle 7','Poer','Cannon','King Kong Cannon','Ora 03'],
    'Haval':['H2','H6','H6 GT','H7','H9','Jolion','Dargo','Dargo X','Big Dog','Raptor'],
    'Honda':['City','Civic','Accord','Insight','HR-V','ZR-V','CR-V','Passport','Pilot','Odyssey','Ridgeline','BR-V','WR-V','e:NS1'],
    'Hongqi':['H5','H6','H9','E-QM5','HS3','HS5','HS7','E-HS9'],
    'Hummer':['H1','H2','H3','H3T'],
    'Hyundai':['Accent','Elantra','Sonata','Azera','i10','i20','i30','Venue','Kona','Creta','Tucson','Santa Fe','Palisade','Stargazer','Staria','Ioniq 5','Ioniq 6','Ioniq 9'],
    'Infiniti':['Q30','Q50','Q60','Q70','QX30','QX50','QX55','QX60','QX70','QX80'],
    'Isuzu':['D-Max','MU-X','N-Series','F-Series'],
    'JAC':['J7','JS2','JS3','JS4','JS6','JS8','T8','T9','E10X'],
    'Jaecoo':['J5','J7','J8'],
    'Jaguar':['XE','XF','XJ','F-Type','E-Pace','F-Pace','I-Pace'],
    'Jeep':['Renegade','Compass','Cherokee','Grand Cherokee','Grand Cherokee L','Wrangler','Gladiator','Wagoneer','Grand Wagoneer','Avenger'],
    'Jetour':['X50','X70','X70 Plus','X90','X90 Plus','X95','T1','T2','Traveller','Dashing'],
    'Kia':['Picanto','Rio','Cerato','K3','K4','K5','K8','K9','Soul','Seltos','Sonet','Sportage','Sorento','Telluride','Carens','Carnival','EV3','EV5','EV6','EV9','Stinger'],
    'KGM':['Tivoli','Korando','Torres','Rexton','Musso','Actyon'],
    'Lamborghini':['Urus','Huracan','Revuelto','Aventador','Gallardo','Murcielago','Temerario'],
    'Land Rover':['Defender 90','Defender 110','Defender 130','Discovery','Discovery Sport','Range Rover','Range Rover Sport','Range Rover Velar','Range Rover Evoque','Freelander'],
    'Leapmotor':['T03','B10','C01','C10','C11','C16'],
    'Lexus':['IS','ES','GS','LS','UX','NX','RX','RZ','GX','LX','RC','LC','LM','LFA'],
    'Li Auto':['L6','L7','L8','L9','MEGA'],
    'Lincoln':['MKZ','Continental','Corsair','Nautilus','Aviator','Navigator'],
    'Lucid':['Air','Gravity'],
    'Mahindra':['Scorpio','Scorpio N','XUV300','XUV400','XUV700','Thar','Bolero','Pik Up'],
    'Maserati':['Ghibli','Quattroporte','Levante','Grecale','GranTurismo','GranCabrio','MC20'],
    'Mazda':['Mazda2','Mazda3','Mazda6','CX-3','CX-30','CX-5','CX-50','CX-60','CX-70','CX-80','CX-90','MX-5','BT-50'],
    'McLaren':['570S','600LT','720S','750S','Artura','GT','GTS','Senna','P1'],
    'Mercedes-Benz':['A-Class','B-Class','C-Class','E-Class','S-Class','CLA','CLS','CLE','GLA','GLB','GLC','GLE','GLS','G-Class','V-Class','Citan','EQB','EQC','EQE','EQE SUV','EQS','EQS SUV','G 580 EQ','AMG GT','SL','Maybach S-Class','Maybach GLS'],
    'MG':['MG3','MG4','MG5','MG6','MG7','ZS','HS','RX5','One','GT','Marvel R','Cyberster'],
    'Mini':['Cooper','Cooper S','Cooper SE','Clubman','Countryman','Paceman','Aceman'],
    'Mitsubishi':['Attrage','Lancer','ASX','Eclipse Cross','Outlander','Pajero','Pajero Sport','Montero','Xpander','L200','Triton'],
    'NIO':['ET5','ET7','EL6','EL7','EL8','EC6','EC7'],
    'Nissan':['Sunny','Sentra','Altima','Maxima','Micra','Juke','Kicks','Qashqai','X-Trail','Rogue','Murano','Pathfinder','Patrol','Armada','Terra','Navara','Frontier','Titan','370Z','Z','GT-R','Ariya'],
    'Omoda':['C5','C7','C9','E5'],
    'Opel':['Corsa','Astra','Insignia','Mokka','Crossland','Grandland','Zafira'],
    'Peugeot':['208','308','408','508','2008','3008','5008','Partner','Rifter'],
    'Polestar':['Polestar 2','Polestar 3','Polestar 4','Polestar 5'],
    'Porsche':['718 Boxster','718 Cayman','911','Panamera','Macan','Cayenne','Taycan'],
    'Proton':['Saga','Persona','Iriz','X50','X70','X90','S70'],
    'Ram':['1500','1500 TRX','1500 RHO','2500','3500','ProMaster'],
    'Renault':['Clio','Megane','Talisman','Captur','Arkana','Koleos','Duster','Austral','Rafale'],
    'Rivian':['R1T','R1S','R2','R3'],
    'Rolls-Royce':['Phantom','Ghost','Wraith','Dawn','Cullinan','Spectre'],
    'Seat':['Ibiza','Leon','Arona','Ateca','Tarraco'],
    'Skoda':['Fabia','Scala','Octavia','Superb','Kamiq','Karoq','Kodiaq','Enyaq'],
    'Smart':['Fortwo','Forfour','#1','#3','#5'],
    'Subaru':['Impreza','Legacy','WRX','BRZ','Crosstrek','Forester','Outback','Ascent','Solterra'],
    'Suzuki':['Alto','Celerio','Swift','Dzire','Baleno','Ciaz','Ignis','Jimny','Vitara','Grand Vitara','S-Cross','Ertiga','Fronx'],
    'Tank':['Tank 300','Tank 400','Tank 500','Tank 700'],
    'Tata':['Tiago','Tigor','Altroz','Punch','Nexon','Harrier','Safari'],
    'Tesla':['Model 3','Model Y','Model S','Model X','Cybertruck','Roadster'],
    'Toyota':['Yaris','Corolla','Corolla Cross','Camry','Avalon','Crown','Prius','C-HR','Raize','RAV4','Highlander','Grand Highlander','Fortuner','4Runner','Land Cruiser','Land Cruiser Prado','Sequoia','Hilux','Tacoma','Tundra','Sienna','Innova','Rush','Supra','GR86'],
    'Volkswagen':['Polo','Golf','Jetta','Passat','Arteon','T-Roc','Taos','Tiguan','Touareg','Teramont','Atlas','ID.3','ID.4','ID.5','ID.6','ID.7'],
    'Volvo':['S60','S90','V60','V90','XC40','XC60','XC90','EX30','EX40','EX90','C40'],
    'XPeng':['P5','P7','G6','G9','X9'],
    'Zeekr':['001','007','009','7X','X','MIX'],
    'Other':['Other']
  };

  const BRAND_NAMES=Object.keys(CATALOG).sort((a,b)=>a.localeCompare(b));
  const TRIMS={
    'Jeep|Grand Cherokee':['Laredo','Altitude','Limited','Overland','Summit','Summit Reserve','Trailhawk','SRT','Trackhawk'],
    'Jeep|Grand Cherokee L':['Laredo','Altitude','Limited','Overland','Summit','Summit Reserve'],
    'Jeep|Wrangler':['Sport','Sport S','Willys','Sahara','Rubicon','Rubicon X','High Altitude','392'],
    'Jeep|Gladiator':['Sport','Sport S','Willys','Mojave','Rubicon','High Altitude'],
    'Jeep|Compass':['Sport','Latitude','Altitude','Limited','Trailhawk'],
    'Toyota|Land Cruiser':['GX','GXR','VX','VXR','GR Sport','ZX'],
    'Toyota|Land Cruiser Prado':['TX','TXL','VX','VXL','Adventure'],
    'Toyota|RAV4':['LE','XLE','XLE Premium','Adventure','Limited','TRD Off-Road','Hybrid'],
    'Ford|F-150':['XL','XLT','Lariat','King Ranch','Platinum','Limited','Tremor','Raptor'],
    'GMC|Yukon':['SLE','SLT','AT4','Denali','Denali Ultimate'],
    'Nissan|Patrol':['XE','SE T2','SE Titanium','LE T1','LE T2','LE Titanium','Nismo']
  };
  const DEFAULT_TRIMS=['Base','Standard','Sport','Premium','Luxury','Limited','Off-Road','Other'];
  const $=id=>document.getElementById(id);
  const lang=()=>window.ZebazLang?.get?.()||document.documentElement.lang||'ku';
  const word=(ku,ar,en)=>lang()==='ar'?ar:lang()==='en'?en:ku;

  function fillBrands(select,keep=''){
    if(!select)return;
    const first=select.querySelector('option[value=""]');
    select.innerHTML='';
    if(first)select.appendChild(first);else{const o=document.createElement('option');o.value='';o.textContent=word('هەموو مارکەکان','كل الماركات','All makes');select.appendChild(o)}
    for(const name of BRAND_NAMES){const o=document.createElement('option');o.value=name;o.textContent=name;select.appendChild(o)}
    if(keep&&BRAND_NAMES.includes(keep))select.value=keep;
  }

  function fillModels(select,brand,allLabel=false){
    if(!select)return;
    const keep=select.value;
    select.innerHTML='';
    const blank=document.createElement('option');blank.value='';blank.textContent=allLabel?word('هەموو مۆدێلەکان','كل الموديلات','All models'):word('مۆدێل هەڵبژێرە','اختر الموديل','Choose model');select.appendChild(blank);
    const models=CATALOG[brand]||[];
    for(const model of models){const o=document.createElement('option');o.value=model;o.textContent=model;select.appendChild(o)}
    select.disabled=!brand;
    if(models.includes(keep))select.value=keep;
  }

  function fillTrims(input,brand,model){
    if(!input)return;
    const list=$('trimSuggestions');
    if(!list)return;
    list.innerHTML='';
    const trims=TRIMS[brand+'|'+model]||DEFAULT_TRIMS;
    for(const trim of trims){const o=document.createElement('option');o.value=trim;list.appendChild(o)}
    input.disabled=!brand||!model;
    input.placeholder=word('تایبەتمەندی بنووسە یان هەڵبژێرە','اكتب أو اختر الفئة','Type or choose trim');
    if(!brand||!model)input.value='';
  }

  function installTrimField(make,model){
    if($('trim'))return $('trim');
    const modelField=model.closest('.c-field');
    if(!modelField)return null;
    const field=document.createElement('div');field.className='c-field';
    const label=document.createElement('label');label.dataset.ku='تایبەتمەندی';label.dataset.ar='الفئة';label.dataset.en='Trim';label.textContent=word('تایبەتمەندی','الفئة','Trim');
    const trim=document.createElement('input');trim.id='trim';trim.required=true;trim.setAttribute('list','trimSuggestions');trim.autocomplete='off';
    const list=document.createElement('datalist');list.id='trimSuggestions';
    field.append(label,trim,list);modelField.after(field);
    fillTrims(trim,make.value,model.value);
    return trim;
  }

  function replaceInputWithSelect(input,id){
    if(!input||input.tagName==='SELECT')return input;
    const s=document.createElement('select');
    s.id=id;
    s.className=input.className;
    s.required=input.required;
    for(const a of [...input.attributes]){
      if(['id','type','placeholder','required','class'].includes(a.name))continue;
      try{s.setAttribute(a.name,a.value)}catch{}
    }
    input.replaceWith(s);
    return s;
  }

  function installSellCatalog(){
    const makeInput=$('make'),modelInput=$('model'),year=$('year');
    if(!makeInput||!modelInput)return;
    const make=replaceInputWithSelect(makeInput,'make');
    const model=replaceInputWithSelect(modelInput,'model');
    fillBrands(make);
    fillModels(model,'');
    make.required=true;model.required=true;
    const trim=installTrimField(make,model);
    make.addEventListener('change',()=>{fillModels(model,make.value);fillTrims(trim,make.value,'')});
    model.addEventListener('change',()=>fillTrims(trim,make.value,model.value));

    if(year){
      year.required=false;
      year.removeAttribute('required');
      year.placeholder=word('ئارەزوومەندانە','اختياري','Optional');
      const label=year.closest('.zc-field')?.querySelector('label');
      if(label&&!label.querySelector('.zc-year-opt')){const s=document.createElement('span');s.className='zc-opt zc-year-opt';s.textContent=word('ئارەزوومەندانە','اختياري','Optional');label.appendChild(s)}
    }
  }

  function installSearchCatalog(){
    const make=$('zcMake'),modelOld=$('zcModel');
    if(!make||!modelOld)return;
    fillBrands(make,make.value);
    const model=replaceInputWithSelect(modelOld,'zcModel');
    fillModels(model,make.value,true);
    make.addEventListener('change',()=>fillModels(model,make.value,true));

    const searchBtn=$('zcSearch');
    searchBtn?.addEventListener('click',()=>{
      const oldSearch=$('search'),oldMake=$('makeFilter');
      if(oldMake){
        const option=[...oldMake.options].find(o=>o.value===make.value);
        oldMake.value=option?make.value:'';
      }
      if(oldSearch){
        oldSearch.value=model.value||(!oldMake?.value?make.value:'');
        oldSearch.dispatchEvent(new Event('input',{bubbles:true}));
      }
    },true);

    model.addEventListener('change',()=>{
      const oldSearch=$('search');
      if(oldSearch&&model.value){oldSearch.value=model.value;oldSearch.dispatchEvent(new Event('input',{bubbles:true}))}
    });
  }

  function installOriginalFilterCatalog(){
    const make=$('makeFilter');
    if(make)fillBrands(make,make.value);
  }

  function addCatalogStyles(){
    if($('zc-catalog-style'))return;
    const s=document.createElement('style');s.id='zc-catalog-style';s.textContent=`
      body.zc-premium .zc-field select{width:100%;border:1px solid #ddd5c9!important;background:#fff!important;color:#222!important;border-radius:11px;padding:11px 12px;outline:none;font:inherit;font-size:13px}
      body.zc-premium .zc-field select:disabled,.zc-search-field select:disabled{background:#f7f5f1!important;color:#aaa!important;cursor:not-allowed}
      .zc-year-opt{margin-inline-start:6px}
      @media(max-width:700px){body.zc-premium .zc-field select{font-size:16px}}
    `;document.head.appendChild(s);
  }

  function boot(){
    addCatalogStyles();
    installOriginalFilterCatalog();
    installSearchCatalog();
    installSellCatalog();
    window.addEventListener('zebaz:lang',()=>{
      const y=$('year');if(y){const b=y.closest('.zc-field')?.querySelector('.zc-year-opt');if(b)b.textContent=word('ئارەزوومەندانە','اختياري','Optional')}
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0));else setTimeout(boot,0);
})();
