'use client'

import { useEffect, useState } from 'react'
import { Upload, FileText, Camera } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from 'next/image'
import { SendDeatils } from '@/function'

interface ParsedData {
  name: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  pincode: string;
}

export default function MainComponent() {
  const [frontDocument, setFrontDocument] = useState<File | null>(null)
  const [backDocument, setBackDocument] = useState<File | null>(null)
  const [frontPreview, setFrontPreview] = useState<string | null>(null)
  const [backPreview, setBackPreview] = useState<string | null>(null)
  const [apiResponse, setApiResponse] = useState<string>("Start Performing OCR by inputting your document front and back")
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)

  // Use effect to load data from local storage when the component mounts
  useEffect(() => {
    const savedData = localStorage.getItem('parsedData');
    if (savedData) {
      setParsedData(JSON.parse(savedData));
      setApiResponse("Loaded saved data from local storage.");
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (side === 'front') {
          setFrontDocument(file)
          setFrontPreview(reader.result as string)
        } else {
          setBackDocument(file)
          setBackPreview(reader.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleParse = async () => {
    setApiResponse("Processing your documents...");

    const formData = new FormData();
    if (frontDocument) formData.append('front', frontDocument);
    if (backDocument) formData.append('back', backDocument);

    try {
      const response = await SendDeatils(formData)
      if (response?.data) {
        console.log(response.data.details)
        setParsedData(response.data.details);
        setApiResponse(response.data.message);
      } else {
        setApiResponse("Parsing Failed: " + response?.data?.message);
      }
    } catch (error) {
      console.error("Error during OCR processing:", error);
      setApiResponse("Error: OCR processing failed.");
    }
  };

  const saveDatas = () => {
    if (parsedData) {
      // Save parsed data to local storage
      localStorage.setItem('parsedData', JSON.stringify(parsedData));
      setApiResponse("Data saved successfully!");
    } else {
      setApiResponse("No data to save.");
    }
  };
  
  const resetDatas = () => {
    // Clear parsed data from local storage and reset state
    localStorage.removeItem('parsedData');
    setParsedData(null);
    setApiResponse("Data cleared.");
  };

  const renderDocumentPreview = (side: 'front' | 'back') => {
    const preview = side === 'front' ? frontPreview : backPreview
    return preview ? (
      <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={preview}
          alt={`${side} document`}
          layout="fill"
          objectFit="contain"
        />
        <button className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md">
          <Camera className="w-5 h-5" />
        </button>
      </div>
    ) : (
      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="w-8 h-8 mb-2 text-gray-500" />
          <p className="text-sm text-gray-500">Click here to Upload/Capture</p>
        </div>
        <input type="file" className="hidden" onChange={(e) => handleFileChange(e, side)} accept="image/*" />
      </label>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">Document Front</h2>
              {renderDocumentPreview('front')}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">Document Back</h2>
              {renderDocumentPreview('back')}
            </CardContent>
          </Card>
          <Button
            className="w-full"
            onClick={handleParse}
            disabled={!frontDocument || !backDocument}
          >
            PARSE DOCUMENT
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <button onClick={saveDatas}
            className='bg-gray-300 p-2 rounded-lg mr-80'>save</button>
            <button onClick={resetDatas}
            className='text-white bg-slate-800 p-2 rounded-lg'>reset</button>
          </div>
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">Parsed Data</h2>
              {parsedData ? (
                <div className="space-y-2">
                  {Object.entries(parsedData).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No data parsed yet</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">API Response</h2>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {apiResponse}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

