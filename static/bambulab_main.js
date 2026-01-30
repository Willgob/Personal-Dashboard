document.addEventListener('DOMContentLoaded', () => {

    async function bambulabpage() {
        const res = await fetch("/Bambulab/status")
        const data = await res.json()
        console.log("loaded");

        bambulab_main_page_data = document.getElementById("bambulab_main_page_nozzle")
        bambulab_main_page_bed = document.getElementById("bambulab_main_page_bed")

        let nozzle_temp = data.print.nozzle_temper;
        let nozzle_target_temp = data.print.nozzle_target_temper;
        let bed_temp = data.print.bed_temper;
        let bed_target_temp = data.print.bed_target_temper;

        bambulab_main_page_data.innerHTML = `<span class="nozzle_temp_bambulab_page title_page_text" >Nozzle Temp : </span>${Math.round(nozzle_temp)}/${Math.round(nozzle_target_temp)} °C`;
        bambulab_main_page_bed.innerHTML = `<span class="bed_temp_bambulab_page title_page_text" >Bed Temp : </span>${Math.round(bed_temp)}/${Math.round(bed_target_temp)} °C`;
    }

    window.Nozzle_temp =  async function() {
        const value = prompt("Enter Nozzle target temp: ");
        const ok = confirm("Confirm to change nozzle temp")
        console.log(value);

        if (!value) return;
        if (isNaN(value)) return alert("Please enter a valid number")
        await fetch(`/Bambulab/nozzle/set/${value}`, methods=["POST"])
    }

    window.Bed_temp = async function() {
        const value = prompt("Enter Bed target temp: ");
        const ok = confirm("Confirm to change bed temp")
        console.log(value);

        if (!value) return;
        if (isNaN(value)) return alert("Please enter a valid number")
        await fetch(`/Bambulab/bed/set/${value}`, methods=["POST"])
    }

    bambulabpage();
    setInterval(bambulabpage, 1000)
});