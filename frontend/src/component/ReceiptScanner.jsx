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
  const scanFile = async (file) => {
  setscanReceiptLoading(true);
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/transaction/scan-receipt`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to scan receipt");
    const result = await response.json();
    console.log(result.success);
    if (result.success === false) {
      toast.error(result.message);
      return; 
    }

    setscannedData(result);
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
  if (scannedData && !scanReceiptLoading && scannedData.success !== false) {
    onScanComplete(scannedData);
    toast.success("Receipt scanned successfully");
  }
}, [scanReceiptLoading, scannedData]);

  return (
   <div className="flex flex-col gap-4">
  <Button
    variant="outline"
    className="bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 text-white hover:opacity-90"
    onClick={() => {
      fileInputRef.current.setAttribute("capture", "environment");
      fileInputRef.current.click();
    }}
    disabled={scanReceiptLoading}
  >
    <Camera className="mr-2" />
    Take a Picture
  </Button>

  <Button
    variant="outline"
    className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white hover:opacity-90"
    onClick={() => {
      fileInputRef.current.removeAttribute("capture");
      fileInputRef.current.click();
    }}
    disabled={scanReceiptLoading}
  >
    📁 Pick from Gallery
  </Button>

  <input
    type="file"
    ref={fileInputRef}
    className="hidden"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) handleReceiptScan(file);
    }}
  />
</div>

  );
}


export default ReceiptScanner