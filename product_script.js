document.addEventListener('DOMContentLoaded', function() {
    // --- Configuration ---
    const PRODUCT_PRICE = 799; 
    const DHAKA_FEE = 60;
    const OUTSIDE_DHAKA_FEE = 120;
    
    // ⚠️ আপনার Discord Webhook URL এখানে বসান ⚠️
    const DISCORD_WEBHOOK_URL = "YOUR_DISCORD_WEBHOOK_URL_HERE"; 
    
    const PRODUCT_NAME = "Premium Star Tee - Galaxy Series";
    const PRODUCT_CODE = "STARTEE799"; 
    
    // --- Elements ---
    const form = document.getElementById('webOrderForm');
    const areaSelect = document.getElementById('area');
    const quantityInput = document.getElementById('quantity');
    const subtotalDisplay = document.getElementById('subtotal');
    const feeDisplay = document.getElementById('delivery-fee');
    const totalDisplay = document.getElementById('final-total');
    const responseMessage = document.getElementById('response-message');
    
    // --- Calculation Function (No change) ---
    function updateTotalPrice() {
        const quantity = parseInt(quantityInput.value) || 0;
        const selectedArea = areaSelect.value;
        
        const subtotal = PRODUCT_PRICE * quantity;
        
        let deliveryFee = 0;
        if (selectedArea === 'Dhaka') {
            deliveryFee = DHAKA_FEE;
        } else if (selectedArea === 'Outside Dhaka') {
            deliveryFee = OUTSIDE_DHAKA_FEE;
        } else {
             deliveryFee = 0;
        }

        const finalTotal = subtotal + deliveryFee;
        
        subtotalDisplay.textContent = `৳ ${subtotal.toFixed(0)}`;
        feeDisplay.textContent = `৳ ${deliveryFee.toFixed(0)}`;
        totalDisplay.textContent = `৳ ${finalTotal.toFixed(0)}`;
    }

    // --- Event Listeners and Submission (No change in logic) ---
    areaSelect.addEventListener('change', updateTotalPrice);
    quantityInput.addEventListener('input', updateTotalPrice);
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        updateTotalPrice(); 

        const formData = new FormData(form);
        const area = formData.get('area');

        if (area === "") {
             responseMessage.textContent = '❌ Error: Please select a Delivery Area.';
             return;
        }
        if (DISCORD_WEBHOOK_URL === "YOUR_DISCORD_WEBHOOK_URL_HERE") {
             responseMessage.textContent = '❌ Error: Please set the Discord Webhook URL in product_script.js.';
             return;
        }
        
        const finalTotal = totalDisplay.textContent.replace('৳ ', '');
        const deliveryFee = feeDisplay.textContent.replace('৳ ', '');
        
        // 1. ডিসকর্ড এমবেড তৈরি
        const embedData = {
            title: "⭐️ New Web Order Received! (Action Needed)",
            color: 0x9C27B0, // VIP Purple
            fields: [
                { name: "📋 Product", value: `${PRODUCT_NAME} (${PRODUCT_CODE})`, inline: false },
                { name: "👤 Customer Name", value: formData.get('name'), inline: true },
                { name: "📞 Phone", value: formData.get('phone'), inline: true },
                { name: "🔢 Qty / Size", value: `${formData.get('quantity')} / ${formData.get('size')}`, inline: true },
                { name: "🏙️ Delivery Area", value: area, inline: true },
                { name: "🚚 Delivery Fee", value: `৳ ${deliveryFee}`, inline: true },
                { name: "💵 **TOTAL PAYABLE**", value: `**৳ ${finalTotal}**`, inline: true },
                { name: "🏠 Full Address", value: formData.get('address'), inline: false }
            ],
            timestamp: new Date().toISOString(),
            footer: { text: "Web Order | ⭐ Star Tee House" }
        };
        
        // 2. Webhook Payload
        const payload = {
            username: "Star Tee House Web Shop Log",
            embeds: [embedData]
        };
        
        responseMessage.textContent = 'Submitting order to Discord...';

        // 3. Webhook-এ POST করা
        fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
        .then(response => {
            if (response.ok) {
                responseMessage.textContent = '✅ আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে! অ্যাডমিনরা Discord-এ নোটিফিকেশন পেয়েছেন।';
                form.reset();
                updateTotalPrice(); 
            } else {
                responseMessage.textContent = `❌ অর্ডার সাবমিট ব্যর্থ হয়েছে। Error: ${response.status}. Webhook URL চেক করুন।`;
                console.error('Webhook failed:', response.status);
            }
        })
        .catch(error => {
            responseMessage.textContent = '❌ কানেকশন এরর। আপনার ইন্টারনেট বা Webhook URL চেক করুন।';
            console.error('Network error:', error);
        });
    });

    // Initial calculation on page load
    updateTotalPrice();
});