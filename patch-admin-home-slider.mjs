import { readFile, writeFile } from 'fs/promises';

// Allow five admin-managed homepage slider image slots.
let server=await readFile('server.js','utf8');
const oldSlots="const CONTENT_SLOTS=new Set(['home_hero','home_owner','studio_main','fb_oil_main','fb_oil_1','fb_oil_2','fb_oil_3','carwash_main','game_center_main','media_main']);";
const newSlots="const CONTENT_SLOTS=new Set(['home_hero','home_owner','home_slider_1','home_slider_2','home_slider_3','home_slider_4','home_slider_5','studio_main','fb_oil_main','fb_oil_1','fb_oil_2','fb_oil_3','carwash_main','game_center_main','media_main']);";
if(server.includes(oldSlots)) server=server.replace(oldSlots,newSlots);
else if(!server.includes("'home_slider_1'")) throw new Error('CONTENT_SLOTS anchor not found');
await writeFile('server.js',server);

// Add the slider slots to the existing Admin content editor.
let admin=await readFile('public/admin.html','utf8');
const oldTail="media_main:'Media — وێنەی سەرەکی'};";
const newTail="media_main:'Media — وێنەی سەرەکی',home_slider_1:'Homepage Slider — وێنەی 1',home_slider_2:'Homepage Slider — وێنەی 2',home_slider_3:'Homepage Slider — وێنەی 3',home_slider_4:'Homepage Slider — وێنەی 4',home_slider_5:'Homepage Slider — وێنەی 5'};";
if(admin.includes(oldTail)) admin=admin.replace(oldTail,newTail);
else if(!admin.includes("home_slider_1:'Homepage Slider")) throw new Error('Admin slots anchor not found');

// Make the content section clearer for slider uploads.
admin=admin.replace('دەتوانیت وێنەی خۆت، وێنەی بنزینخانەکان، شۆردنگە، ستودیۆ و بەشەکانی تر لێرە دابنێیت.','دەتوانیت وێنەی خۆت، وێنەی بنزینخانەکان، شۆردنگە، ستودیۆ و هەروەها 5 وێنەی Homepage Slider لێرە دابنێیت. بۆ Slider وێنەی 16:9 و کوالێتی بەرز بەکاربهێنە.');
await writeFile('public/admin.html',admin);

console.log('Homepage slider admin slots enabled');
