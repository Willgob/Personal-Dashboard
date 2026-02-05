document.addEventListener('DOMContentLoaded', () => {
    async function debug() {
        try {
            const res = await fetch("/");
            const data = await res.text();
            debug_item_home = document.getElementById("debug_item_home");
            console.log("Data : ", data);
            if (data.includes("Sorry, the page you are looking for does not exist.")) {
                console.log("ERROR");
                debug_item_home.innerHTML = "Base Status: ERROR"
            } else {
                console.log("Active");
                debug_item_home.innerHTML = "Base Status: Active"
            }
        } catch (e) {
            console.log("Error : ", e);
        }
    };

    debug();
    setInterval(debug, 2500);
});