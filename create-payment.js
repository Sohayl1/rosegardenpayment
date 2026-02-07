const axios = require('axios');

export default async function handler(req, res) {
    // إعدادات CORS للسماح لموقعك بالاتصال
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // البيانات الحقيقية من حسابك (الصور المرفقة)
    const PROFILE_ID = "150492"; //
    const SERVER_KEY = "SMJ9TL99MB-JMLKJ2HDKN-NJGD6NNG6W"; //

    const { customerDetails, totalAmount } = req.body;

    // رابط بوابة الدفع (بما أن حسابك مصري EGY)
    const url = "https://secure-egypt.paytabs.com/payment/request";

    const payload = {
        profile_id: PROFILE_ID,
        tran_type: "sale",
        tran_class: "ecom",
        cart_id: "order_" + Date.now(),
        cart_description: "Rose Garden Order",
        cart_currency: "EGP", // يجب أن تطابق عملة الحساب (مصر = EGP)
        cart_amount: totalAmount,
        callback: "https://www.rosegardenflowerstore.com",
        return: "https://www.rosegardenflowerstore.com",
        customer_details: {
            name: customerDetails.name,
            email: customerDetails.email || "customer@rosegarden.com",
            phone: customerDetails.phone,
            street: customerDetails.address,
            city: "Alexandria",
            country: "EG"
        }
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                "authorization": SERVER_KEY,
                "content-type": "application/json"
            }
        });

        if (response.data && response.data.redirect_url) {
            res.status(200).json({ redirect_url: response.data.redirect_url });
        } else {
            console.error("PayTabs Error:", response.data);
            res.status(400).json({ error: response.data.message || "Failed to get redirect URL" });
        }
    } catch (error) {
        console.error("Server Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}