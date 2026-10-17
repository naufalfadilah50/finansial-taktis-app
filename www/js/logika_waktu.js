function updateJam() {
    const waktu = new Date();
    
    // Format Jam
    const jamFormat = waktu.toLocaleTimeString('id-ID', { hour12: false });
    
    // Format Tanggal
    const opsiTanggal = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
    const tanggalFormat = waktu.toLocaleDateString('id-ID', opsiTanggal);

    // Kirim ke HTML
    document.getElementById('realtime-clock').textContent = jamFormat;
    
    const dateElement = document.getElementById('realtime-date');
    if (dateElement) {
        dateElement.textContent = tanggalFormat;
    }
}
setInterval(updateJam, 1000);
updateJam();

// Fungsi Kalkulasi Sisa Hari Gajian
const TARGET_TANGGAL_GAJIAN = 25; 

function hitungSisaHari(tanggalGajian) {
    const hariIni = new Date();
    let targetGajian = new Date(hariIni.getFullYear(), hariIni.getMonth(), tanggalGajian);

    if (hariIni.getDate() >= tanggalGajian) {
        targetGajian.setMonth(targetGajian.getMonth() + 1);
    }

    const selisihWaktu = targetGajian.getTime() - hariIni.getTime();
    const sisaHari = Math.ceil(selisihWaktu / (1000 * 3600 * 24));
    
    const elemenSisaHari = document.getElementById('sisa-hari');
    if (elemenSisaHari) {
        elemenSisaHari.textContent = `Sisa ${sisaHari} hari`;
    }
}
hitungSisaHari(TARGET_TANGGAL_GAJIAN);