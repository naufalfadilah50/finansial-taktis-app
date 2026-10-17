let dataKeuangan = JSON.parse(localStorage.getItem('keuanganPolri')) || { totalSaldo: 0, totalTabungan: 0, riwayat: [], tanggalGajian: 25 };

function formatRupiah(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
}

function getPeriodeAwal(date, tglGajian) {
    let d = new Date(date);
    if (d.getDate() < tglGajian) {
        d.setMonth(d.getMonth() - 1);
    }
    d.setDate(tglGajian);
    d.setHours(0,0,0,0);
    return d;
}

function getPeriodeString(date, tglGajian) {
    let awal = getPeriodeAwal(date, tglGajian);
    let akhir = new Date(awal);
    akhir.setMonth(akhir.getMonth() + 1);
    akhir.setDate(tglGajian - 1);

    const opsi = { day: 'numeric', month: 'short', year: 'numeric' };
    return `${awal.toLocaleDateString('id-ID', opsi)} - ${akhir.toLocaleDateString('id-ID', opsi)}`;
}

function renderRekap() {
    const setahunLalu = new Date();
    setahunLalu.setFullYear(setahunLalu.getFullYear() - 1);

    let riwayatBaru = [];
    dataKeuangan.riwayat.forEach(trx => {
        let trxDate = trx.isoDate ? new Date(trx.isoDate) : new Date(trx.id);
        if (trxDate >= setahunLalu) riwayatBaru.push(trx);
    });

    if (riwayatBaru.length !== dataKeuangan.riwayat.length) {
        dataKeuangan.riwayat = riwayatBaru;
        localStorage.setItem('keuanganPolri', JSON.stringify(dataKeuangan));
    }

    const tglGajian = parseInt(dataKeuangan.tanggalGajian) || 25;
    let groupedData = {};
    const periodeSekarangStr = getPeriodeString(new Date(), tglGajian);

    dataKeuangan.riwayat.forEach(trx => {
        let trxDate = trx.isoDate ? new Date(trx.isoDate) : new Date(trx.id);
        let pStr = getPeriodeString(trxDate, tglGajian);
        
        if (!groupedData[pStr]) {
            groupedData[pStr] = { masuk: 0, keluar: 0, nabung: 0, trxs: [], timestampAwal: getPeriodeAwal(trxDate, tglGajian).getTime() };
        }
        groupedData[pStr].trxs.push(trx);
        if (trx.jenis === 'masuk') groupedData[pStr].masuk += trx.nominal;
        else if (trx.jenis === 'keluar') groupedData[pStr].keluar += trx.nominal;
        else if (trx.jenis === 'nabung') groupedData[pStr].nabung += trx.nominal;
    });

    const elemenSaldo = document.getElementById('saldo-rekap');
    const elemenTabungan = document.getElementById('tabungan-rekap');
    if (elemenSaldo) elemenSaldo.textContent = formatRupiah(dataKeuangan.totalSaldo);
    if (elemenTabungan) elemenTabungan.textContent = '• Tabungan: ' + formatRupiah(dataKeuangan.totalTabungan);

    let currentData = groupedData[periodeSekarangStr] || { masuk: 0, keluar: 0, nabung: 0 };
    document.getElementById('label-periode-sekarang').textContent = `REKAP KEUANGAN - PERIODE SAAT INI (${periodeSekarangStr.toUpperCase()})`;
    document.getElementById('total-pemasukan').textContent = formatRupiah(currentData.masuk);
    document.getElementById('total-pengeluaran').textContent = formatRupiah(currentData.keluar);
    document.getElementById('total-tabungan-rekap').textContent = formatRupiah(currentData.nabung);
    document.getElementById('saldo-bersih').textContent = formatRupiah(currentData.masuk - currentData.keluar - currentData.nabung);

    const pastContainer = document.getElementById('riwayat-lama-container');
    let pastHtml = '';
    let sortedPeriods = Object.keys(groupedData).sort((a, b) => groupedData[b].timestampAwal - groupedData[a].timestampAwal);

    sortedPeriods.forEach((periode, index) => {
        if (periode === periodeSekarangStr) return; 
        
        let data = groupedData[periode];
        let saldoBersih = data.masuk - data.keluar - data.nabung;
        
        let trxHtml = '';
        data.trxs.forEach(trx => {
             let iconHtml = '', colorClass = '', tanda = '';
             if (trx.jenis === 'masuk') { iconHtml = `↗`; colorClass = 'text-green'; tanda = '+'; }
             else if (trx.jenis === 'keluar') { iconHtml = `↘`; colorClass = 'text-red'; tanda = '-'; }
             else if (trx.jenis === 'nabung') { iconHtml = `⛁`; colorClass = 'text-gold'; tanda = '-'; }

             trxHtml += `
             <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #232733;">
                 <div>
                    <p style="font-size:12px; font-weight:bold;">${iconHtml} ${trx.keterangan}</p>
                    <p style="font-size:10px; color:#7a8291; margin-top:2px;">${trx.tanggalString} • ${trx.kategori}</p>
                 </div>
                 <div class="${colorClass}" style="font-size:12px; font-weight:bold;">${tanda}${formatRupiah(trx.nominal)}</div>
             </div>`;
        });

        pastHtml += `
        <div class="card" style="margin-bottom:12px; cursor:pointer;" onclick="toggleAccordion('acc-${index}')">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h4 style="font-size:11px; color:#d4af37;">PERIODE: ${periode}</h4>
                <span style="font-size:10px; color:#7a8291;">(Klik Detail) ▼</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:10px;">
                <div>
                    <p style="font-size:10px; color:#7a8291;">Pemasukan</p>
                    <p class="text-green" style="font-size:11px; font-weight:bold;">${formatRupiah(data.masuk)}</p>
                </div>
                <div>
                    <p style="font-size:10px; color:#7a8291;">Pengeluaran</p>
                    <p class="text-red" style="font-size:11px; font-weight:bold;">${formatRupiah(data.keluar)}</p>
                </div>
                <div style="text-align:right;">
                    <p style="font-size:10px; color:#7a8291;">Sisa Uang</p>
                    <p style="font-size:11px; font-weight:bold; color:#2196f3;">${formatRupiah(saldoBersih)}</p>
                </div>
            </div>
            
            <div id="acc-${index}" style="display:none; margin-top:12px; padding-top:12px; border-top:1px dashed #232733;">
                <p style="font-size:10px; color:#d4af37; margin-bottom:8px; font-weight:bold;">RIWAYAT TRANSAKSI BULAN INI:</p>
                ${trxHtml}
            </div>
        </div>`;
    });

    if (pastHtml === '') pastHtml = `<p style="text-align:center; color:#7a8291; font-size:11px; margin-top:20px;">Belum ada data dari bulan sebelumnya.</p>`;
    if (pastContainer) pastContainer.innerHTML = pastHtml;

    // LOGIKA ALERT HEBOH DI HALAMAN REKAP
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
}

window.toggleAccordion = function(id) {
    let el = document.getElementById(id);
    el.style.display = (el.style.display === 'none') ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', renderRekap);