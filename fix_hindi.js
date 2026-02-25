// fix_hindi.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load Environment Variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: .env file not found or keys missing!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const updates = [
  // --- ELECTRICIAN ---
  { name: "Fan Installation", hindi: "सीलिंग फैन फिटिंग" },
  { name: "Switchboard Repair", hindi: "स्विचबोर्ड रिपेयर" },
  { name: "MCB Fuse Replacement", hindi: "एमसीबी/फ्यूज बदलना" },
  { name: "Inverter Installation", hindi: "इन्वर्टर इंस्टॉलेशन" },

  // --- PLUMBER ---
  { name: "Tap Repair/Change", hindi: "नल रिपेयर/बदलना" },
  { name: "Blockage Removal", hindi: "नाली जाम खोलना" },
  { name: "Water Tank Cleaning", hindi: "पानी टंकी सफाई" },
  { name: "Wash Basin Installation", hindi: "वॉश बेसिन फिटिंग" },

  // --- CARPENTER ---
  { name: "Door Lock Repair", hindi: "दरवाजा लॉक रिपेयर" },
  { name: "Curtain Rod Installation", hindi: "पर्दे की रॉड लगाना" },
  { name: "Furniture Assembly", hindi: "फर्नीचर असेंबली" },

  // --- AC & APPLIANCES ---
  { name: "AC Service (Split/Window)", hindi: "एसी सर्विस (सर्विसिंग)" },
  { name: "RO Filter Change", hindi: "RO फ़िल्टर चेंज" },
  { name: "Geyser Repair", hindi: "गीज़र रिपेयर" }
];

async function fixLanguages() {
  console.log("🚀 Starting Language Repair...");

  for (const item of updates) {
    // 1. Update Hindi Name
    const { error } = await supabase
      .from('services')
      .update({ hindi_name: item.hindi })
      .eq('name', item.name);

    if (error) {
      console.error(`❌ Failed to fix: ${item.name}`, error.message);
    } else {
      console.log(`✅ Fixed Hindi for: ${item.name} -> ${item.hindi}`);
    }
  }

  console.log("\n🎉 All Done! Please refresh your website.");
}

fixLanguages();