import { useState } from "react";
import { useParams } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { ProductForm } from "@/components/dashboard/ProductForm";

// Mock data for editing - in real app, fetch from database
const mockProducts: Record<string, { name: string; sku: string; description: string; costPrice: string; sellingPrice: string; startingQuantity: string; lowStockThreshold: string }> = {
  "1": { name: "12W LED Bulb", sku: "LED-12W-001", description: "High-quality 12W LED bulb with warm white light", costPrice: "120", sellingPrice: "250", startingQuantity: "450", lowStockThreshold: "50" },
  "2": { name: "9W LED Bulb", sku: "LED-9W-002", description: "Energy-efficient 9W LED bulb", costPrice: "80", sellingPrice: "180", startingQuantity: "320", lowStockThreshold: "50" },
  "3": { name: "Flood Light 50W", sku: "FL-50W-001", description: "Outdoor waterproof flood light", costPrice: "800", sellingPrice: "1500", startingQuantity: "25", lowStockThreshold: "30" },
  "4": { name: "Strip Light 5m", sku: "SL-5M-001", description: "Flexible LED strip light, 5 meters", costPrice: "350", sellingPrice: "600", startingQuantity: "8", lowStockThreshold: "20" },
  "5": { name: "Panel Light 18W", sku: "PL-18W-001", description: "Slim panel light for ceilings", costPrice: "450", sellingPrice: "800", startingQuantity: "120", lowStockThreshold: "30" },
  "6": { name: "Downlight 12W", sku: "DL-12W-001", description: "Recessed downlight fixture", costPrice: "280", sellingPrice: "500", startingQuantity: "200", lowStockThreshold: "40" },
  "7": { name: "Tube Light 20W", sku: "TL-20W-001", description: "T8 LED tube light replacement", costPrice: "180", sellingPrice: "350", startingQuantity: "15", lowStockThreshold: "25" },
  "8": { name: "Street Light 100W", sku: "STL-100W-001", description: "High-power street light fixture", costPrice: "2500", sellingPrice: "4500", startingQuantity: "45", lowStockThreshold: "10" },
};

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const productData = id ? mockProducts[id] : undefined;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <Header onMenuToggle={toggleSidebar} title="Edit Product" />

        <div className="p-4 md:p-8 w-full">
          {productData ? (
            <ProductForm initialData={productData} isEditing productId={id} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Product not found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EditProduct;
