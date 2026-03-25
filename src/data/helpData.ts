export interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

export interface HelpCategory {
    id: string;
    title: string;
    faqs: FAQItem[];
}

export const helpCategories: Record<string, HelpCategory> = {
    "general-issues": {
        id: "general-issues",
        title: "General Issues",
        faqs: [
            {
                id: "gi-1",
                question: "The app says \"GPS Signal Lost\" even when I'm outside.",
                answer: "Ensure \"High Accuracy\" is on in your phone settings and Grid.pe has \"Allow all the time\" location access. Avoid using power-saver mode during shifts."
            },
            {
                id: "gi-2",
                question: "My account is \"Under Review.\" Why can't I go online?",
                answer: "This happens if your documents (DL/RC) have expired or if there was a safety report. Check your \"Notifications\" for the specific reason and next steps."
            },
            {
                id: "gi-3",
                question: "I'm not getting any orders. Is the app broken?",
                answer: "Likely not. Try moving to a \"Hotspot\" (indicated on your map) or check if you have the latest app update in the Play Store/App Store."
            },
            {
                id: "gi-4",
                question: "How do I update my phone number? I lost my old SIM.",
                answer: "For your security, phone changes require a selfie-verification. Go to Help > General Issues > Change Number to start the process."
            },
            {
                id: "gi-5",
                question: "The app keeps logging me out automatically.",
                answer: "This usually happens if you log in from a second device. Ensure you are only using one phone for your Grid.pe account."
            },
            {
                id: "gi-6",
                question: "Can I work in a different city for a few days?",
                answer: "You are assigned to a specific base city. To change cities, you must submit a \"Relocation Request\" in the Profile section, which takes 3–5 days to process."
            },
            {
                id: "gi-7",
                question: "Why did my \"Rider Rating\" drop suddenly?",
                answer: "Ratings are based on your last 50 orders. A few low ratings from customers or long wait times at restaurants can pull the average down."
            },
            {
                id: "gi-8",
                question: "I want to delete my account. What happens to my unpaid earnings?",
                answer: "All pending earnings will be settled to your primary bank account within 7 days of account deletion."
            },
            {
                id: "gi-9",
                question: "The app is taking up too much storage space.",
                answer: "Go to App Info > Storage > Clear Cache. Do NOT \"Clear Data\" unless you are okay with logging in again."
            },
            {
                id: "gi-10",
                question: "How do I contact my local Fleet Manager?",
                answer: "Go to Support > General Issues > Contact Manager. Their details are available only when you are \"On-Duty.\""
            }
        ]
    },
    "faqs": {
        id: "faqs",
        title: "FAQs",
        faqs: [
            {
                id: "faq-1",
                question: "The customer is not picking up the phone. What do I do with the order?",
                answer: "Wait at the location for 10 minutes. The app will then allow you to \"Mark Customer Unavailable.\" Follow the instructions on whether to return the item or dispose of it."
            },
            {
                id: "faq-2",
                question: "Why didn't I get the \"Weekend Milestone\" bonus?",
                answer: "Check if you met the \"Minimum Orders\" AND \"Minimum Online Hours\" requirements. Both must be met to qualify for the bonus."
            },
            {
                id: "faq-3",
                question: "A customer asked me to deliver to a different address.",
                answer: "Never deliver to an unverified address. Ask the customer to change it in their app. If they can't, contact Support to protect your payout."
            },
            {
                id: "faq-4",
                question: "I received a \"Cash\" tip. Do I have to report it in the app?",
                answer: "No. Cash tips are 100% yours and do not need to be reported. Online tips are also 100% yours and are sent directly to your bank."
            },
            {
                id: "faq-5",
                question: "How do \"Rainy Day\" incentives work?",
                answer: "During heavy rain, we add an extra ₹20–₹50 per order. This is automatically added to your \"Extra Earnings\" and reflects in your Wallet the next day."
            },
            {
                id: "faq-6",
                question: "Can I reject an order if the distance is too far?",
                answer: "You can, but it will lower your \"Acceptance Rate.\" If your rate falls below 80%, you may be ineligible for daily incentives."
            },
            {
                id: "faq-7",
                question: "The app says \"Order Picked Up,\" but I don't have the items yet.",
                answer: "Only swipe \"Picked Up\" once the items are physically in your hand/bag. Swiping early can lead to \"Long Wait\" penalties."
            },
            {
                id: "faq-8",
                question: "I missed a milestone by just 1 order. Can it be adjusted?",
                answer: "Unfortunately, the system is automated and cannot be adjusted manually. Always try to finish your milestones 30 mins before the deadline."
            }
        ]
    },
    "wallet-faqs": {
        id: "wallet-faqs",
        title: "Grid.Pe Wallet FAQs",
        faqs: [
            {
                id: "wf-1",
                question: "Why is my Wallet balance lower than my Total Earnings?",
                answer: "Total Earnings is your \"Gross\" income. The Wallet shows your \"Net\" amount after mandatory TDS (1%), platform fees, and any Instant Payouts you've already taken."
            },
            {
                id: "wf-2",
                question: "I requested an Instant Payout, but the money hasn't hit my bank.",
                answer: "Most transfers happen in 10 minutes. If delayed, check your \"Transaction History\" for a UTR number. This proves the money has left Grid.pe and is being processed by your bank."
            },
            {
                id: "wf-3",
                question: "My Auto-Payout failed. Is my money lost?",
                answer: "Never. If a payout fails, the money stays safe in your Wallet. Click \"Troubleshoot\" on the Wallet screen to update your bank details and retry."
            },
            {
                id: "wf-4",
                question: "Can I use someone else's bank account for my payouts?",
                answer: "No. For security and tax reasons, the bank account name must match the name on your Grid.pe Rider Profile."
            },
            {
                id: "wf-5",
                question: "What is the \"Minimum Balance\" to use 'Need Money Now'?",
                answer: "You need at least ₹500 in your wallet to request an Instant Payout."
            },
            {
                id: "wf-6",
                question: "Why was ₹250 deducted as a \"Penalty\"?",
                answer: "Penalties are usually due to late pickups or cancelled orders. Click the transaction in your Wallet History to see the specific Order ID and reason."
            },
            {
                id: "wf-7",
                question: "How do I get my TDS (Tax) back?",
                answer: "Grid.pe deposits your TDS with the Govt. You can claim this refund by filing your ITR at the end of the financial year using the certificates in Profile > Documents."
            },
            {
                id: "wf-8",
                question: "Does Grid.pe charge a fee for the Weekly Auto-Payout?",
                answer: "No. Weekly and Monthly scheduled payouts are 100% free. Only \"Instant Payouts\" carry a small convenience fee."
            },
            {
                id: "wf-9",
                question: "I changed my bank account. When will the next payout go there?",
                answer: "If you update it 24 hours before the payout date (Tuesday), it will go to the new account. Otherwise, it will trigger on the following cycle."
            },
            {
                id: "wf-10",
                question: "Can I withdraw my \"Referral Bonus\" instantly?",
                answer: "Referral bonuses are credited to your Wallet once your friend completes their first 10 deliveries. Once credited, you can withdraw them like regular earnings."
            }
        ]
    },
    "safety": {
        id: "safety",
        title: "Safety Toolkit",
        faqs: [
            {
                id: "sf-1",
                question: "I had a minor accident. What is the first thing I should do?",
                answer: "First, get to a safe spot. Then, tap the SOS button or call Support. We will pause your active order and guide you on the insurance process."
            },
            {
                id: "sf-2",
                question: "A customer is refusing to let me leave or being abusive.",
                answer: "Stay calm and do not argue. Use the SOS button to alert our safety team. We track your live location and will intervene or call the authorities if needed."
            },
            {
                id: "sf-3",
                question: "My bike was stolen while I was making a delivery?",
                answer: "Immediately file an FIR at the nearest police station. Share a copy of the FIR with us via Help > Safety Toolkit to initiate insurance support."
            },
            {
                id: "sf-4",
                question: "Does Grid.pe insurance cover my medical bills?",
                answer: "Yes, active riders are covered for accidental medical expenses up to ₹1 Lakh. Ensure you keep all hospital bills and prescriptions."
            },
            {
                id: "sf-5",
                question: "I feel sick and can't finish my active delivery?",
                answer: "Tap \"Vehicle/Health Issue\" in the order screen. We will re-assign the order. Please do not just leave the order unattended."
            },
            {
                id: "sf-6",
                question: "Is there a \"Night Shift\" safety feature?",
                answer: "Yes. Between 11 PM and 6 AM, the SOS button stays on your main screen, and our safety team monitors \"Long Idle\" stops automatically."
            },
            {
                id: "sf-7",
                question: "How do I report a dangerous road or a \"Black Zone\"?",
                answer: "Go to Safety Toolkit > Report Location. This helps us warn other riders and adjust delivery times for that area."
            },
            {
                id: "sf-8",
                question: "Can I bring a friend along while I ride?",
                answer: "For safety and insurance reasons, \"Pillion Riding\" is strictly prohibited while you are On-Duty."
            },
            {
                id: "sf-9",
                question: "What happens if I trigger the SOS button by mistake?",
                answer: "An agent will call you immediately. Just inform them it was an accident. Frequent false alarms may lead to a temporary account warning."
            },
            {
                id: "sf-10",
                question: "Does Grid.pe provide helmets or safety gear?",
                answer: "You can purchase Grid.pe branded, ISI-certified helmets and jackets at a subsidized rate from your local Hub."
            }
        ]
    }
};
