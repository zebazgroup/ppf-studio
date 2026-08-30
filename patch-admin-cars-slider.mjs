import { readFile, writeFile } from 'fs/promises';

let server=await readFile('server.js','utf8');
if(!server.includes("'cars_slider_1'")){
  const anchor="'home_slider_5','studio_main'";
  const insert="'home_slider_5','cars_slider_1','cars_slider_2','cars_slider_3','cars_slider_4','cars_slider_5','studio_main'";
  if(!server.includes(anchor)) throw new Error('Cars slider CONTENT_SLOTS anchor not found');
  server=server.replace(anchor,insert);
}
await writeFile('server.js',server);

let admin=await readFile('public/admin.html','utf8');
if(!admin.includes("cars_slider_1:'ZEBAZ Cars Slider")){
  const anchor="home_slider_5:'Homepage Slider — وێنەی 5'};";
  const insert="home_slider_5:'Homepage Slider — وێنەی 5',cars_slider_1:'ZEBAZ Cars Slider — وێنەی 1',cars_slider_2:'ZEBAZ Cars Slider — وێنەی 2',cars_slider_3:'ZEBAZ Cars Slider — وێنەی 3',cars_slider_4:'ZEBAZ Cars Slider — وێنەی 4',cars_slider_5:'ZEBAZ Cars Slider — وێنەی 5'};";
  if(!admin.includes(anchor)) throw new Error('Cars slider admin anchor not found');
  admin=admin.replace(anchor,insert);
}
admin=admin.replace('هەروەها 5 وێنەی Homepage Slider لێرە دابنێیت. بۆ Slider وێنەی 16:9 و کوالێتی بەرز بەکاربهێنە.','هەروەها 5 وێنەی Homepage Slider و 5 وێنەی ZEBAZ Cars Slider لێرە دابنێیت. بۆ هەردوو Slider ـەکە وێنەی 16:9، 1920×1080 یان زیاتر و کوالێتی بەرز بەکاربهێنە.');
await writeFile('public/admin.html',admin);
console.log('ZEBAZ Cars slider admin slots enabled');
