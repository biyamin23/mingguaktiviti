import { createClient } from "@supabase/supabase-js";
import fs from "fs";

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl && fs.existsSync(".env.local")) {
  const content = fs.readFileSync(".env.local", "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
      supabaseUrl = trimmed.replace("NEXT_PUBLIC_SUPABASE_URL=", "").trim();
    }
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=")) {
      supabaseKey = trimmed.replace("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=", "").trim();
    }
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_ANON_KEY=")) {
      supabaseKey = trimmed.replace("NEXT_PUBLIC_SUPABASE_ANON_KEY=", "").trim();
    }
  }
}

console.log("Testing Supabase connection with URL:", supabaseUrl);

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.from("teachers").select("count").limit(1);
    if (error) {
      console.log("STATUS: ERROR querying teachers table:", error.message, "code:", error.code);
    } else {
      console.log("STATUS: SUCCESS querying teachers table! Data:", data);
    }

    const { data: todosData, error: todosError } = await supabase.from("todos").select("count").limit(1);
    if (todosError) {
      console.log("STATUS: todos table:", todosError.message);
    } else {
      console.log("STATUS: todos table exists! Data:", todosData);
    }
  } catch (err) {
    console.error("Connection exception:", err);
  }
}

testConnection();
