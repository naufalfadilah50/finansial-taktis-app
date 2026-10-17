// ================= STATE / DATA MEMORI =================
let dataKeuangan = JSON.parse(localStorage.getItem('keuanganPolri')) || {
    totalSaldo: 0,
    totalTabungan: 0,
    terpakaiHariIni: 0,
    tanggalTerakhirAktif: new Date().toISOString().split('T')[0],
    tanggalGajian: 25, 
    riwayat: [] 
};

// ================= FUNGSI FORMAT RUPIAH =================
function formatRupiah(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
}

function setTanggalDefault() {
    let now = new Date();
    let yyyy = now.getFullYear();
    let mm = String(now.getMonth() + 1).padStart(2, '0');
    let dd = String(now.getDate()).padStart(2, '0');
    let formatTgl = `${yyyy}-${mm}-${dd}`;
    
    document.getElementById('tgl-masuk').value = formatTgl;
    document.getElementById('tgl-nabung').value = formatTgl;
    document.getElementById('tgl-keluar').value = formatTgl;
}

// ================= FUNGSI UPDATE UI =================
function updateDashboardUI() {
    let hariIni = new Date().toISOString().split('T')[0];
    if (dataKeuangan.tanggalTerakhirAktif !== hariIni) {
        dataKeuangan.terpakaiHariIni = 0;
        dataKeuangan.tanggalTerakhirAktif = hariIni;
        simpanKeLocalStorage();
    }

    document.getElementById('text-tgl-gajian').textContent = `Setiap Tanggal: ${dataKeuangan.tanggalGajian}`;

    const TARGET_GAJIAN = parseInt(dataKeuangan.tanggalGajian) || 25;
    const now = new Date();
    let targetDate = new Date(now.getFullYear(), now.getMonth(), TARGET_GAJIAN);
    if (now.getDate() >= TARGET_GAJIAN) {
        targetDate.setMonth(targetDate.getMonth() + 1);
    }
    const sisaHari = Math.ceil((targetDate - now) / (1000 * 3600 * 24));

    let batasHarian = 0;
    if (sisaHari > 0 && dataKeuangan.totalSaldo > 0) {
        batasHarian = Math.floor(dataKeuangan.totalSaldo / sisaHari);
    }

    document.querySelector('.saldo-amount').textContent = formatRupiah(dataKeuangan.totalSaldo);
    document.querySelector('.tabungan-text').textContent = '• Tabungan: ' + formatRupiah(dataKeuangan.totalTabungan);
    document.querySelector('.batas-harian').textContent = formatRupiah(batasHarian);
    
    const elemenTerpakai = document.querySelector('.info-text .text-gold');
    if (elemenTerpakai) elemenTerpakai.textContent = formatRupiah(dataKeuangan.terpakaiHariIni);

    const elemenSisaHari = document.getElementById('sisa-hari');
    if (elemenSisaHari) elemenSisaHari.textContent = `Sisa ${sisaHari} hari ke gajian`;

    const badgeStatus = document.querySelector('.badge-aman');
    const progressBar = document.querySelector('.progress-bar');
    const alertContainer = document.getElementById('alert-heboh-container');
    
    let persentase = 0;
    if (batasHarian > 0) {
        persentase = (dataKeuangan.terpakaiHariIni / batasHarian) * 100;
    }
    if (persentase > 100) persentase = 100;
    
    if (progressBar) {
        progressBar.style.width = persentase + '%';
        progressBar.style.backgroundColor = '#d4af37'; 
    }
    if (badgeStatus) {
        badgeStatus.textContent = 'AMAN';
        badgeStatus.style.backgroundColor = 'rgba(212, 175, 55, 0.2)';
        badgeStatus.style.color = '#d4af37';
        badgeStatus.style.border = '1px solid #d4af37';
    }
    
    if (alertContainer) {
        alertContainer.innerHTML = ''; 
    }

    // LOGIKA JIKA BOROS
    if (dataKeuangan.terpakaiHariIni > batasHarian && batasHarian > 0) {
        let kelebihan = dataKeuangan.terpakaiHariIni - batasHarian;
        
        if (alertContainer) {
            alertContainer.innerHTML = `
                <div style="background-color: rgba(127, 29, 29, 0.3); border: 1px solid #ef4444; padding: 16px; border-radius: 6px; margin-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="background-color: #ef4444; color: white; font-weight: bold; padding: 2px 8px; border-radius: 4px; font-size: 12px;">⚠️</span>
                        <h4 style="color: #ef4444; font-size: 12px; font-weight: 800; letter-spacing: 0.5px;">PERINGATAN - PENGELUARAN HARIAN MELEBIHI BATAS!</h4>
                    </div>
                    <p style="font-size: 11px; color: #fca5a5; line-height: 1.5;">
                        Hari ini kamu telah menghabiskan <strong style="color: white;">${formatRupiah(dataKeuangan.terpakaiHariIni)}</strong>, melampaui batas aman harian <strong style="color: white;">${formatRupiah(batasHarian)}</strong>.<br>
                        Kelebihan: <strong style="color: white;">${formatRupiah(kelebihan)}</strong>. Segera kendalikan pengeluaran!
                    </p>
                </div>
            `;
        }

        if (badgeStatus) {
            badgeStatus.textContent = 'BOROS';
            badgeStatus.style.backgroundColor = 'rgba(244, 67, 54, 0.2)';
            badgeStatus.style.color = '#f44336';
            badgeStatus.style.border = '1px solid #f44336';
        }
        if (progressBar) {
            progressBar.style.backgroundColor = '#f44336'; 
        }
    }
}

// ================= FUNGSI PENCATATAN =================
function simpanKeLocalStorage() {
    localStorage.setItem('keuanganPolri', JSON.stringify(dataKeuangan));
    updateDashboardUI();
}

function simpanTglGajian() {
    let tgl = parseInt(document.getElementById('input-tgl-gajian').value);
    if (tgl >= 1 && tgl <= 31) {
        dataKeuangan.tanggalGajian = tgl;
        simpanKeLocalStorage();
        tutupModal('modal-gajian');
    } else {
        alert('Masukkan tanggal antara 1 sampai 31!');
    }
}

// Tambahan isoDate agar rekap bulanan sangat akurat
function catatRiwayat(jenis, nominal, keterangan, kategori, inputTgl) {
    const waktu = new Date();
    const dString = inputTgl ? new Date(inputTgl) : waktu;
    const opsiTanggal = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    
    const transaksiBaru = {
        id: Date.now(),
        tanggalString: dString.toLocaleDateString('id-ID', opsiTanggal),
        jam: waktu.toLocaleTimeString('id-ID', { hour12: false }),
        jenis: jenis, 
        nominal: nominal,
        keterangan: keterangan || 'Tanpa Keterangan',
        kategori: kategori || '-',
        isoDate: dString.toISOString() 
    };

    dataKeuangan.riwayat.unshift(transaksiBaru); 
}

function simpanPemasukan() {
    let nominal = parseInt(document.getElementById('nominal-masuk').value);
    let keterangan = document.getElementById('ket-masuk').value;
    let kategori = document.getElementById('kat-masuk').value;
    let tgl = document.getElementById('tgl-masuk').value;

    if (nominal > 0) {
        dataKeuangan.totalSaldo += nominal;
        catatRiwayat('masuk', nominal, keterangan, kategori, tgl);
        simpanKeLocalStorage();
        tutupModal('modal-masuk');
        document.getElementById('nominal-masuk').value = '';
        document.getElementById('ket-masuk').value = '';
    } else {
        alert('Masukkan nominal yang benar!');
    }
}

function simpanPengeluaran() {
    let nominal = parseInt(document.getElementById('nominal-keluar').value);
    let keterangan = document.getElementById('ket-keluar').value;
    let kategori = document.getElementById('kat-keluar').value;
    let tgl = document.getElementById('tgl-keluar').value || new Date().toISOString().split('T')[0];

    if (nominal > 0) {
        if (nominal > dataKeuangan.totalSaldo) {
            alert('Saldo tidak cukup komandan!');
            return;
        }
        dataKeuangan.totalSaldo -= nominal;
        
        let hariIni = new Date().toISOString().split('T')[0];
        if(tgl === hariIni) {
            dataKeuangan.terpakaiHariIni += nominal;
        }
        
        catatRiwayat('keluar', nominal, keterangan, kategori, tgl);
        simpanKeLocalStorage();
        tutupModal('modal-keluar');
        document.getElementById('nominal-keluar').value = '';
        document.getElementById('ket-keluar').value = '';
    } else {
        alert('Masukkan nominal yang benar!');
    }
}

function simpanTabungan() {
    let nominal = parseInt(document.getElementById('nominal-nabung').value);
    let keterangan = document.getElementById('ket-nabung').value;
    let tgl = document.getElementById('tgl-nabung').value;

    if (nominal > 0) {
        if (nominal > dataKeuangan.totalSaldo) {
            alert('Saldo untuk ditabung tidak cukup!');
            return;
        }
        dataKeuangan.totalSaldo -= nominal; 
        dataKeuangan.totalTabungan += nominal;
        catatRiwayat('nabung', nominal, keterangan, 'Tabungan', tgl);
        simpanKeLocalStorage();
        tutupModal('modal-nabung');
        document.getElementById('nominal-nabung').value = '';
        document.getElementById('ket-nabung').value = '';
    } else {
        alert('Masukkan nominal yang benar!');
    }
}

// ================= FUNGSI MODAL =================
function bukaModal(idModal) {
    document.getElementById(idModal).style.display = 'flex';
    setTanggalDefault();
}
function tutupModal(idModal) {
    document.getElementById(idModal).style.display = 'none';
}
window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', updateDashboardUI);