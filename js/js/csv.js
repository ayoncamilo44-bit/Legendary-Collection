/**
 * CSV Utility for Legendary Collection
 * Uses PapaParse via CDN
 */

function ensurePapaParse(callback) {
  if (window.Papa) {
    callback();
    return;
  }
  const script = document.createElement('script');
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js";
  script.onload = callback;
  document.head.appendChild(script);
}

/**
 * EXPORT: Converts array of database records into a downloadable .csv file
 */
function exportToCSV(requestData) {
  if (!requestData || !requestData.length) {
    alert("No data available to export.");
    return;
  }

  ensurePapaParse(() => {
    const formattedRows = requestData.map(item => ({
      "Signer Name": item.signer_name || "",
      "Date Sent": item.date_sent || "",
      "Date Received": item.date_received || "",
      "Status": item.status || "Pending",
      "Fee Paid": item.fee_amount || 0,
      "Items": Array.isArray(item.request_items) 
        ? item.request_items.map(i => i.item_name || i).join("; ") 
        : (item.item_name || ""),
      "Notes": item.notes || ""
    }));

    const csvContent = Papa.unparse(formattedRows);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `legendary_collection_ttm_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

/**
 * IMPORT: Reads an uploaded CSV file and returns array of JSON objects
 */
function parseUploadedCSV(event, onComplete) {
  const file = event.target.files[0];
  if (!file) return;

  ensurePapaParse(() => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        if (onComplete) onComplete(results.data);
      },
      error: function(err) {
        alert("Error reading CSV file: " + err.message);
      }
    });
  });
}
