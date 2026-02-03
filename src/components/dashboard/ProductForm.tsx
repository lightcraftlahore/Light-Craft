import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X, Save, Package, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createProduct, updateProduct, Product } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ProductFormData {
  name: string;
  sku: string;
  description: string;
  costPrice: string;
  sellingPrice: string;
  stock: string;
}

interface ProductFormProps {
  initialData?: Product;
  isEditing?: boolean;
  productId?: string;
}

export function ProductForm({ initialData, isEditing = false, productId }: ProductFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    description: initialData?.description || "",
    costPrice: initialData?.costPrice?.toString() || "",
    sellingPrice: initialData?.sellingPrice?.toString() || "",
    stock: initialData?.stock?.toString() || "",
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image?.url || null);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        toast({
          title: "Image too large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

    // Selling price is optional - only validate if provided
    if (formData.sellingPrice && (isNaN(Number(formData.sellingPrice)) || Number(formData.sellingPrice) < 0)) {
      newErrors.sellingPrice = "Enter a valid price";
    }

    if (!formData.stock) {
      newErrors.stock = "Stock quantity is required";
    } else if (
      isNaN(Number(formData.stock)) ||
      Number(formData.stock) < 0 ||
      !Number.isInteger(Number(formData.stock))
    ) {
      newErrors.stock = "Enter a valid whole number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const apiFormData = new FormData();
      apiFormData.append("name", formData.name.trim());
      apiFormData.append("sku", formData.sku.trim());
      apiFormData.append("description", formData.description.trim());
      apiFormData.append("costPrice", formData.costPrice);
      apiFormData.append("sellingPrice", formData.sellingPrice);
      apiFormData.append("stock", formData.stock);

      if (imageFile) {
        apiFormData.append("image", imageFile);
      }

      if (isEditing && productId) {
        await updateProduct(productId, apiFormData);
        toast({
          title: "Product Updated",
          description: `${formData.name} has been updated successfully`,
        });
      } else {
        await createProduct(apiFormData);
        toast({
          title: "Product Created",
          description: `${formData.name} has been added to inventory`,
        });
      }

      navigate("/inventory");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/inventory")}
          className="p-2 rounded-xl hover:bg-secondary transition-colors"
          disabled={isSubmitting}
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
                disabled={isSubmitting}
                className={cn(
                  "w-full h-11 px-4 rounded-xl bg-secondary border-2 text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors disabled:opacity-50",
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
                disabled={isSubmitting || isEditing}
                className={cn(
                  "w-full h-11 px-4 rounded-xl bg-secondary border-2 text-foreground placeholder:text-muted-foreground focus:outline-none font-mono transition-colors disabled:opacity-50",
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
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border-2 border-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none transition-colors disabled:opacity-50"
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">Pricing & Stock</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                disabled={isSubmitting}
                className={cn(
                  "w-full h-11 px-4 rounded-xl bg-secondary border-2 text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors disabled:opacity-50",
                  errors.costPrice ? "border-destructive" : "border-transparent focus:border-primary"
                )}
              />
            </FormField>

            <FormField
              label="Selling Price (Rs.)"
              error={errors.sellingPrice}
            >
              <input
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => handleInputChange("sellingPrice", e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                disabled={isSubmitting}
                className={cn(
                  "w-full h-11 px-4 rounded-xl bg-secondary border-2 text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors disabled:opacity-50",
                  errors.sellingPrice ? "border-destructive" : "border-transparent focus:border-primary"
                )}
              />
            </FormField>

            <FormField
              label="Stock Quantity"
              required
              error={errors.stock}
            >
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", e.target.value)}
                placeholder="0"
                min="0"
                step="1"
                disabled={isSubmitting}
                className={cn(
                  "w-full h-11 px-4 rounded-xl bg-secondary border-2 text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors disabled:opacity-50",
                  errors.stock ? "border-destructive" : "border-transparent focus:border-primary"
                )}
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
                disabled={isSubmitting}
                className="absolute -top-2 -right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className={cn(
              "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors",
              isSubmitting && "opacity-50 cursor-not-allowed"
            )}>
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm font-medium text-muted-foreground">Click to upload image</span>
              <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isSubmitting}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate("/inventory")}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-secondary text-foreground font-bold hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {isEditing ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                {isEditing ? "Update Product" : "Save Product"}
              </>
            )}
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