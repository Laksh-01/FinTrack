import { useRef, useEffect } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { useState } from "react";


const ReceiptScanner = ({ onScanComplete }) => {
  const fileInputRef = useRef(null);
  const [scanReceiptLoading , setscanReceiptLoading] = useState(false);
  const [scannedData,setscannedData] = useState("");
  const [scanReceiptFn,setscanReceiptFn] = useState("");
//   const {
//     loading: scanReceiptLoading,
//     fn: scanReceiptFn,
//     data: scannedData,
//   } = useFetch(scanReceipt);


const scanFile = async (file) => {
  setscanReceiptLoading(true);
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`http://localhost:3000/api/transaction/scan-receipt`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to scan receipt");

    const result = await response.json();
    console.log(result);
    setscannedData(result); // or result.data if you structure it like that
  } catch (error) {
    console.error("Error:", error);
    toast.error("Failed to scan receipt");
  } finally {  
    setscanReceiptLoading(false);
  }
};
   

  const handleReceiptScan = async (file) => {
  if (file.size > 5 * 1024 * 1024) {
    toast.error("File size should be less than 5MB");
    return;
  }

  await scanFile(file);
};


  useEffect(() => {
    if (scannedData && !scanReceiptLoading) {
      onScanComplete(scannedData);
      toast.success("Receipt scanned successfully");
    }
  }, [scanReceiptLoading, scannedData]);

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReceiptScan(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white"
        onClick={() => fileInputRef.current?.click()}
        disabled={scanReceiptLoading}
      >
        {scanReceiptLoading ? (
          <>
            <Loader2 className="mr-2 animate-spin" />
            <span>Scanning Receipt...</span>
          </>
        ) : (  
          <>
            <Camera className="mr-2" />
            <span>Scan Receipt with AI</span>
          </>
        )}
      </Button>
    </div>
  );
}


export default ReceiptScanner