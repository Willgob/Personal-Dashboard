document.addEventListener('DOMContentLoaded', () => {

    function getFilamentHex(rawData) {
        if(!rawData || rawData.length < 6) return "#888888";
        const rgb = rawData.substring(0,6);

        return "#" +rgb;
    }

    function hexToRGB(hex) {
        const r = parseInt(hex.substring(1,3), 16);
        const g = parseInt(hex.substring(3,5), 16);
        const b = parseInt(hex.substring(5,7), 16);
        return {r,g,b};
    }

    function GetBrightness({r, g,b }) {
        return(r*299 + g*587 + b*114) / 1000;
    }

    function getTextColor(backgroundHex) {
        const rgb = HexToRGB(backgroundHex)
        const brightness = GetBrightness(rgb);
        return brightness > 128 ? "#000" :"#fff";
    }

    async function flilament_color() {
        const res = await fetch("/Bambulab/status")
        const data = await res.json()
        console.log("loaded");

        filament_card = document.getElementById("filament-card");
        filament_color = getFilamentHex(data.print.ams.ams[0].tray[0].cols[0])
        filament_card.style.backgroundColor = filament_color;

    }


    flilament_color();
    setInterval(flilament_color, 1000);
});