import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FAQ_DB = [
    {
        keywords: ["payout", "payment", "money", "earnings", "withdraw"],
        answer: "Withdrawals are processed within 24-48 hours. You can view your detailed earnings in the Wallet section. For pending payments beyond 48 hours, please raise a support ticket."
    },
    {
        keywords: ["shift", "check in", "check out", "online", "offline"],
        answer: "Ensure you are within the hub radius to start your shift. If you encounter GPS errors, please restart the app and check your location permissions."
    },
    {
        keywords: ["kyc", "documents", "verification", "license", "pan"],
        answer: "KYC verification typically takes 24 hours. Ensure your documents are clear and valid. You will receive a notification once your account is verified."
    },
    {
        keywords: ["order", "assigned", "delivered", "id"],
        answer: "If an order status is not updating, please use the 'Help with this order' button on the tracking screen or share the Order ID here."
    },
    {
        keywords: ["hello", "hi", "zing", "help"],
        answer: "Hello. I am Zing, your professional assistant. How can I assist you with your rider duties today?"
    }
];

const FALLBACK = "I couldn't find a specific answer for that. Please try rephrasing or navigate to the 'Help & Support' section to raise a ticket with our team.";

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
    
    try {
        const { message, hasImage } = await req.json();
        
        if (hasImage) {
            return new Response(
                JSON.stringify({ reply: "I have received your document/image. A support executive will review this if you attach it to a formal ticket in the Help section." }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            );
        }

        const query = (message || "").toLowerCase();
        let matched = FAQ_DB.find(entry => entry.keywords.some(k => query.includes(k)));

        return new Response(
            JSON.stringify({ reply: matched ? matched.answer : FALLBACK }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    } catch (err) {
        return new Response(
            JSON.stringify({ reply: "An error occurred. Please try again later." }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    }
})
