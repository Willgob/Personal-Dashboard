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
        const rgb = hexToRGB(backgroundHex)
        const brightness = GetBrightness(rgb);
        return brightness > 128 ? "#000" :"#fff";
    }

    async function flilament_color() {
        const res = await fetch("/Bambulab/status")
        const data = await res.json()
        console.log("loaded");

        for(let i = 0; i<4; i++) {
            const color = data.print.ams.ams[0].tray[i].cols[0];
            const card = document.getElementById(`filament-card-${i+1}`);
            const text = document.getElementById(`filament-text-${i+1}`);
            const type = document.getElementById(`filament-type-${i+1}`);

            const filament_color = getFilamentHex(color);
            const text_color = getTextColor(filament_color);
            const filament_type = data.print.ams.ams[0].tray[i].tray_type

            card.style.backgroundColor = filament_color;
            text.style.color = text_color
            type.innerHTML = filament_type;
        }

    }

    window.filament_data = async function(tray_number) {
        const res= await fetch("/Bambulab/status")
        const data = await res.json()
        console.log("loaded");

        const tray_data = data.print.ams.ams[0].tray[tray_number]

        alert(`Tray - ${tray_number + 1} \n Type - ${tray_data.tray_type} / ${tray_data.tray_sub_brands}\n Remaining - ${tray_data.remain}% \n Nozzle Temp Min - ${tray_data.nozzle_temp_min}°C \n Nozzle Temp Max - ${tray_data.nozzle_temp_max}°C`)
    }


    flilament_color();
    setInterval(flilament_color, 1000);
});