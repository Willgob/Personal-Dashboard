document.addEventListener('DOMContentLoaded', () => {

    async function bambulabpage() {
        const res = await fetch("/Bambulab/status")
        const data = await res.json()
        console.log("loaded");

        bambulab_main_page_data = document.getElementById("bambulab_main_page_nozzle")

        let nozzle_temp = data.print.nozzle_temper;
        let nozzle_target_temp = data.print.nozzle_target_temper;

        bambulab_main_page_data.innerHTML = `<span class="nozzle_temp_bambulab_page">Nozzle Temp : </span>${Math.round(nozzle_temp)}/${Math.round(nozzle_target_temp)} °C`;
    }

    bambulabpage();
    setInterval(bambulabpage, 1000)
});