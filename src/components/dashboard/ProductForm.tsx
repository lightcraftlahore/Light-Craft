import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X, Save, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductFormData {
  name: string;
  sku: string;
  description: string;
  costPrice: string;
  sellingPrice: string;
  startingQuantity: string;
  lowStockThreshold: string;
  image?: string;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  isEditing?: boolean;
  productId?: string;
}

export function ProductForm({ initialData, isEditing = false, productId }: ProductFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    description: initialData?.description || "",
    costPrice: initialData?.costPrice || "",
    sellingPrice: initialData?.sellingPrice || "",
    startingQuantity: initialData?.startingQuantity || "",
    lowStockThreshold: initialData?.lowStockThreshold || "20",
    image: initialData?.image || "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: "Image must be less than 5MB" }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData((prev) => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Product name must be less than 100 characters";
    }

    if (!formData.sku.trim()) {
      newErrors.sku = "SKU is required";
    } else if (!/^[A-Za-z0-9-]+$/.test(formData.sku)) {
      newErrors.sku = "SKU can only contain letters, numbers, and hyphens";
    }

    if (!formData.costPrice) {
      newErrors.costPrice = "Cost price is required";
    } else if (isNaN(Number(formData.costPrice)) || Number(formData.costPrice) < 0) {
      newErrors.costPrice = "Enter a valid price";
    }

    if (!formData.sellingPrice) {
      newErrors.sellingPrice = "Selling price is required";
    } else if (isNaN(Number(formData.sellingPrice)) || Number(formData.sellingPrice) < 0) {
      newErrors.sellingPrice = "Enter a valid price";
    }

    if (!formData.startingQuantity) {
      newErrors.startingQuantity = "Starting quantity is required";
    } else if (
      isNaN(Number(formData.startingQuantity)) ||
      Number(formData.startingQuantity) < 0 ||
      !Number.isInteger(Number(formData.startingQuantity))
    ) {
      newErrors.startingQuantity = "Enter a valid whole number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // TODO: Save to database
      console.log("Saving product:", formData);
      navigate("/inventory");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/inventory")}
          className="p-2 rounded-xl hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? "Update product details" : "Enter product information to add to inventory"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Product Name"
              required
              error={errors.name}
            >
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., 12W LED Bulb"
                className={cn(
                  "w-full h-11 px-4 rounded-xl bg-secondary border-2 text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors",
                  errors.name ? "border-destructive" : "border-transparent focus:border-primary"
                )}
              />
            </FormField>

            <FormField
              label="SKU / Barcode"
              required
              error={errors.sku}
            >
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleInputChange("sku", e.target.value.toUpperCase())}
                placeholder="e.g., LED-12W-001"
                className={cn(
                  "w-full h-11 px-4 rounded-xl bg-secondary border-2 text-foreground placeholder:text-muted-foreground focus:outline-none font-mono transition-colors",
                  errors.sku ? "border-destructive" : "border-transparent focus:border-primary"
                )}
              />
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Description">
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter product description (optional)"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border-2 border-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none transition-colors"
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">Pricing & Stock</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Cost Price (Rs.)"
              required
              error={errors.costPrice}
            >
              <input
                type="number"
                value={formData.costPrice}
                onChange={(e) => handleInputChange("costPrice", e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className={cn(
                  "w-full h-11 px-4 rounded-xl bg-secondary border-2 text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors",
                  errors.costPrice ? "border-destructive" : "border-transparent focus:border-primary"
                )}
              />
            </FormField>

            <FormField
              label="Selling Price (Rs.)"
              required
              error={errors.sellingPrice}
            >
              <input
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => handleInputChange("sellingPrice", e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className={cn(
                  "w-full h-11 px-4 rounded-xl bg-secondary border-2 text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors",
                  errors.sellingPrice ? "border-destructive" : "border-transparent focus:border-primary"
                )}
              />
            </FormField>

            <FormField
              label="Starting Quantity"
              required
              error={errors.startingQuantity}
            >
              <input
                type="number"
                value={formData.startingQuantity}
                onChange={(e) => handleInputChange("startingQuantity", e.target.value)}
                placeholder="0"
                min="0"
                step="1"
                className={cn(
                  "w-full h-11 px-4 rounded-xl bg-secondary border-2 text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors",
                  errors.startingQuantity ? "border-destructive" : "border-transparent focus:border-primary"
                )}
              />
            </FormField>

            <FormField label="Low Stock Threshold">
              <input
                type="number"
                value={formData.lowStockThreshold}
                onChange={(e) => handleInputChange("lowStockThreshold", e.target.value)}
                placeholder="20"
                min="0"
                step="1"
                className="w-full h-11 px-4 rounded-xl bg-secondary border-2 border-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </FormField>
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">Product Image (Optional)</h2>
          
          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Product preview"
                className="w-40 h-40 object-cover rounded-xl border border-border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground shadow-lg hover:scale-110 transition-transform"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm font-medium text-muted-foreground">Click to upload image</span>
              <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
          {errors.image && <p className="text-sm text-destructive mt-2">{errors.image}</p>}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate("/inventory")}
            className="px-6 py-3 rounded-xl bg-secondary text-foreground font-bold hover:bg-secondary/80 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
          >
            <Save className="h-5 w-5" />
            {isEditing ? "Update Product" : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
