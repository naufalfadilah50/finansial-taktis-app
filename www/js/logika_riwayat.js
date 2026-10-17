let dataKeuangan = JSON.parse(localStorage.getItem('keuanganPolri')) || { totalSaldo: 0, totalTabungan: 0, terpakaiHariIni: 0, riwayat: [], tanggalGajian: 25 };

function formatRupiah(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
}

window.hapusTransaksi = function(id) {
    if (confirm("Apakah komandan yakin ingin menghapus transaksi ini? Saldo akan dikalkulasi ulang otomatis.")) {
        const index = dataKeuangan.riwayat.findIndex(trx => trx.id === id);
        
        if (index !== -1) {
            const trx = dataKeuangan.riwayat[index];
            
            if (trx.jenis === 'masuk') {
                dataKeuangan.totalSaldo -= trx.nominal;
            } else if (trx.jenis === 'keluar') {
                dataKeuangan.totalSaldo += trx.nominal;
                let hariIni = new Date().toISOString().split('T')[0];
                let trxHariIni = trx.isoDate ? trx.isoDate.split('T')[0] : "";
                if (trxHariIni === hariIni) {
                    dataKeuangan.terpakaiHariIni -= trx.nominal;
                    if (dataKeuangan.terpakaiHariIni < 0) dataKeuangan.terpakaiHariIni = 0;
                }
            } else if (trx.jenis === 'nabung') {
                dataKeuangan.totalSaldo += trx.nominal;
                dataKeuangan.totalTabungan -= trx.nominal;
            }

            dataKeuangan.riwayat.splice(index, 1);
            localStorage.setItem('keuanganPolri', JSON.stringify(dataKeuangan));
            renderRiwayat();
        }
    }
}

function renderRiwayat() {
    const container = document.getElementById('list-riwayat');
    
    // Update Teks Total Saldo & Tabungan di Header Riwayat
    document.getElementById('saldo-riwayat').textContent = formatRupiah(dataKeuangan.totalSaldo);
    const elemenTabungan = document.getElementById('tabungan-riwayat');
    if (elemenTabungan) elemenTabungan.textContent = '• Tabungan: ' + formatRupiah(dataKeuangan.totalTabungan);

    // LOGIKA ALERT HEBOH DI HALAMAN RIWAYAT
    const tglGajian = parseInt(dataKeuangan.tanggalGajian) || 25;
    const now = new Date();
    let targetDate = new Date(now.getFullYear(), now.getMonth(), tglGajian);
    if (now.getDate() >= tglGajian) targetDate.setMonth(targetDate.getMonth() + 1);
    const sisaHari = Math.ceil((targetDate - now) / (1000 * 3600 * 24));
    let batasHarian = (sisaHari > 0 && dataKeuangan.totalSaldo > 0) ? Math.floor(dataKeuangan.totalSaldo / sisaHari) : 0;

    const alertContainer = document.getElementById('alert-heboh-container');
    if (alertContainer) {
        if (dataKeuangan.terpakaiHariIni > batasHarian && batasHarian > 0) {
            let kelebihan = dataKeuangan.terpakaiHariIni - batasHarian;
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
        } else {
            alertContainer.innerHTML = '';
        }
    }

    if (!dataKeuangan || !dataKeuangan.riwayat || dataKeuangan.riwayat.length === 0) {
        if(container) container.innerHTML = `<p style="text-align: center; color: #7a8291; font-size: 12px; margin-top: 30px;">Belum ada transaksi yang dicatat.</p>`;
        return;
    }

    let htmlKonten = '';
    let tanggalSaatIni = '';

    dataKeuangan.riwayat.forEach(trx => {
        if (trx.tanggalString !== tanggalSaatIni) {
            htmlKonten += `<div class="timeline-date">${trx.tanggalString.toUpperCase()}</div>`;
            tanggalSaatIni = trx.tanggalString;
        }

        let iconHtml = '';
        let colorClass = '';
        let tanda = '';

        if (trx.jenis === 'masuk') {
            iconHtml = `<div class="trx-icon" style="background-color: rgba(76, 175, 80, 0.1); color: #4caf50;">↗</div>`;
            colorClass = 'text-green';
            tanda = '+';
        } else if (trx.jenis === 'keluar') {
            iconHtml = `<div class="trx-icon" style="background-color: rgba(244, 67, 54, 0.1); color: #f44336;">↘</div>`;
            colorClass = 'text-red';
            tanda = '-';
        } else if (trx.jenis === 'nabung') {
            iconHtml = `<div class="trx-icon" style="background-color: rgba(212, 175, 55, 0.1); color: #d4af37;">⛁</div>`;
            colorClass = 'text-gold';
            tanda = '-';
        }

        htmlKonten += `
        <div class="trx-item" style="display: flex; justify-content: space-between; align-items: center; background-color: #15181f; padding: 12px; border-radius: 6px; margin-bottom: 8px; border: 1px solid #232733;">
            <div class="trx-left" style="display: flex; align-items: center; gap: 12px;">
                ${iconHtml}
                <div>
                    <p class="trx-title" style="font-size: 13px; font-weight: bold;">${trx.keterangan}</p>
                    <p class="trx-cat" style="font-size: 10px; color: #7a8291; margin-top: 3px;">${trx.kategori} • ${trx.jam}</p>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <div class="trx-amount ${colorClass}" style="font-size: 13px; font-weight: bold;">${tanda}${formatRupiah(trx.nominal)}</div>
                <button onclick="hapusTransaksi(${trx.id})" style="background: none; border: none; color: #ef4444; font-size: 14px; cursor: pointer; padding: 4px 8px; font-weight: bold;">✕</button>
            </div>
        </div>
        `;
    });

    if(container) container.innerHTML = htmlKonten;
}

document.addEventListener('DOMContentLoaded', renderRiwayat);