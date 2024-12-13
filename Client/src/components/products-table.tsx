import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Plus, Upload, Package } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Product {
  id: number
  name: string
  description: string
  price: number
  type: string
  author?: string
  subject?: string
  size?: string
  schoolSupplyType?: string
  imageUrl?: string
  createdAt: string
}

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [editType, setEditType] = useState<string>("")

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `http://localhost:5272/api/products?search=${search}&type=${selectedType}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [search, selectedType])

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    // Validate that type is selected
    const type = formData.get("type")
    if (!type) {
      alert("Please select a product type")
      return
    }

    const productData = {
      name: formData.get("name")?.toString() || "",
      description: formData.get("description")?.toString() || "",
      price: parseFloat(formData.get("price")?.toString() || "0"),
      type: type.toString(),
      author: type === "books" ? formData.get("author")?.toString() : null,
      subject: type === "books" ? formData.get("subject")?.toString() : null,
      size: type === "uniforms" ? formData.get("size")?.toString() : null,
      schoolSupplyType: type === "school_supplies" ? formData.get("schoolSupplyType")?.toString() : null,
      imageUrl: imagePreview
    }

    try {
      const response = await fetch("http://localhost:5272/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        setIsAddDialogOpen(false)
        form.reset()
        fetchProducts()
      } else {
        const error = await response.json()
        alert(error.message || "Failed to add product")
      }
    } catch (error) {
      console.error("Error adding product:", error)
      alert("Failed to add product")
    }
  }

  const handleEditProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!currentProduct) return

    const form = e.currentTarget
    const formData = new FormData(form)

    const productData = {
      name: formData.get("name")?.toString() || "",
      description: formData.get("description")?.toString() || "",
      price: parseFloat(formData.get("price")?.toString() || "0"),
      type: formData.get("type")?.toString() || "",
      author: formData.get("type") === "books" ? formData.get("author")?.toString() : null,
      subject: formData.get("type") === "books" ? formData.get("subject")?.toString() : null,
      size: formData.get("type") === "uniforms" ? formData.get("size")?.toString() : null,
      schoolSupplyType: formData.get("type") === "school_supplies" ? formData.get("schoolSupplyType")?.toString() : null,
      imageUrl: imagePreview || currentProduct.imageUrl
    }

    try {
      const response = await fetch(
        `http://localhost:5272/api/products/${currentProduct.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(productData),
        }
      )

      if (response.ok) {
        setIsEditDialogOpen(false)
        setCurrentProduct(null)
        setImagePreview(null)
        fetchProducts()
      } else {
        const error = await response.json()
        alert(error.message || "Failed to update product")
      }
    } catch (error) {
      console.error("Error updating product:", error)
      alert("Failed to update product")
    }
  }

  const handleDelete = async () => {
    if (!productToDelete || !productToDelete.id) return;

    try {
      const response = await fetch(
        `http://localhost:5272/api/products/${productToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
        fetchProducts();
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    } finally {
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddDialogOpen = (isOpen: boolean) => {
    setIsAddDialogOpen(isOpen)
    if (isOpen) {
      setImagePreview(null)
    }
  }

  const formatPrice = (price: number) => {
    return `₱${price.toFixed(2)}`
  }

  const handleEditDialogOpen = (isOpen: boolean, product?: Product) => {
    if (isOpen && product) {
      setCurrentProduct(product)
      setEditType(product.type)
      setImagePreview(product.imageUrl || null)
    } else {
      setCurrentProduct(null)
      setEditType("")
      setImagePreview(null)
    }
    setIsEditDialogOpen(isOpen)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2"
        >
          <option value="all">All Types</option>
          <option value="books">Books</option>
          <option value="uniforms">Uniforms</option>
          <option value="school_supplies">School Supplies</option>
        </select>
        <Dialog open={isAddDialogOpen} onOpenChange={handleAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" name="price" type="number" step="0.01" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    name="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background"
                    onChange={(e) => setSelectedType(e.target.value)}
                    required
                  >
                    <option value="" disabled selected>Select Type</option>
                    <option value="books">Books</option>
                    <option value="uniforms">Uniforms</option>
                    <option value="school_supplies">School Supplies</option>
                  </select>
                </div>
              </div>

              {selectedType === "books" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="author">Author</Label>
                    <Input id="author" name="author" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" name="subject" required />
                  </div>
                </div>
              )}

              {selectedType === "uniforms" && (
                <div className="grid gap-2">
                  <Label htmlFor="size">Size</Label>
                  <select
                    id="size"
                    name="size"
                    className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background"
                    required
                  >
                    <option value="" disabled selected>Select Size</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="2XL">2XL</option>
                    <option value="3XL">3XL</option>
                  </select>
                </div>
              )}

              {selectedType === "school_supplies" && (
                <div className="grid gap-2">
                  <Label htmlFor="schoolSupplyType">Supply Type</Label>
                  <Input id="schoolSupplyType" name="schoolSupplyType" required />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="imageUrl">Product Image</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="file"
                      id="imageUrl"
                      name="imageUrl"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('imageUrl')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </Button>
                  </div>
                  {imagePreview && (
                    <div className="relative h-20 w-20">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full rounded-md object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full">Add Product</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Image</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>{formatPrice(product.price)}</TableCell>
                <TableCell className="capitalize">{product.type.replace('_', ' ')}</TableCell>
                <TableCell>
                  {product.type === "books" && (
                    <>
                      {product.author && <div>Author: {product.author}</div>}
                      {product.subject && <div>Subject: {product.subject}</div>}
                    </>
                  )}
                  {product.type === "uniforms" && (
                    <>{product.size && <div>Size: {product.size}</div>}</>
                  )}
                  {product.type === "school_supplies" && (
                    <>{product.schoolSupplyType && <div>Type: {product.schoolSupplyType}</div>}</>
                  )}
                  {!product.author && !product.subject && !product.size && !product.schoolSupplyType && (
                    <span className="text-muted-foreground">No additional details</span>
                  )}
                </TableCell>
                <TableCell>{formatDate(product.createdAt)}</TableCell>
                <TableCell>
                  {product.imageUrl ? (
                    <div className="h-12 w-12 relative">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full rounded-md object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "fallback-image-url"
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border">
                      <DropdownMenuItem 
                        onClick={() => handleEditDialogOpen(true, product)}
                        className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Product being set for deletion:", product);
                          setProductToDelete(product);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditProduct} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input id="edit-name" name="name" defaultValue={currentProduct?.name} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Price</Label>
                <Input id="edit-price" name="price" type="number" step="0.01" defaultValue={currentProduct?.price} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input id="edit-description" name="description" defaultValue={currentProduct?.description} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Type</Label>
                <select
                  id="edit-type"
                  name="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  required
                >
                  <option value="" disabled>Product Type</option>
                  <option value="books">Books</option>
                  <option value="uniforms">Uniforms</option>
                  <option value="school_supplies">School Supplies</option>
                </select>
              </div>
            </div>

            {editType === "books" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-author">Author</Label>
                    <Input id="edit-author" name="author" defaultValue={currentProduct?.author} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-subject">Subject</Label>
                    <Input id="edit-subject" name="subject" defaultValue={currentProduct?.subject} required />
                  </div>
                </div>
              </div>
            )}

            {editType === "uniforms" && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-size">Size</Label>
                  <select
                    id="edit-size"
                    name="size"
                    className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background"
                    defaultValue={currentProduct?.size || ""}
                    required
                  >
                    <option value="" disabled>Select Size</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="2XL">2XL</option>
                    <option value="3XL">3XL</option>
                  </select>
                </div>
              </div>
            )}

            {editType === "school_supplies" && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-schoolSupplyType">Supply Type</Label>
                  <Input 
                    id="edit-schoolSupplyType" 
                    name="schoolSupplyType" 
                    defaultValue={currentProduct?.schoolSupplyType} 
                    required 
                  />
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="edit-imageUrl">Product Image</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="file"
                    id="edit-imageUrl"
                    name="imageUrl"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('edit-imageUrl')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                </div>
                {imagePreview ? (
                  <div className="relative h-20 w-20">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full rounded-md object-cover"
                    />
                  </div>
                ) : currentProduct?.imageUrl ? (
                  <div className="relative h-20 w-20">
                    <img
                      src={currentProduct.imageUrl}
                      alt="Current"
                      className="h-full w-full rounded-md object-cover"
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <Button type="submit" className="w-full">Save Changes</Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={(open) => {
          if (!open) setProductToDelete(null);
          setIsDeleteDialogOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product "{productToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 