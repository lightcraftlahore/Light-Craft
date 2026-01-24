import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { ProductForm } from "@/components/dashboard/ProductForm";

const AddProduct = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <Header onMenuToggle={toggleSidebar} title="Add Product" />

        <div className="p-4 md:p-8 w-full">
          <ProductForm />
        </div>
      </main>
    </div>
  );
};

export default AddProduct;
