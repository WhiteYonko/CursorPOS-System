import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Save } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { ProductRepository } from "../../data/repositories/ProductRepository";
import { Product } from "../../data/models/Product";

type AdjustmentReason = "returns" | "shrinkage" | "correction" | "restock";

interface AdjustmentForm {
	productId: string;
	quantity: number;
	reason: AdjustmentReason;
	notes: string;
}

function StockAdjustmentsPage() {
	const { setTitle } = useApp();
	const navigate = useNavigate();
	const [product, setProduct] = useState<Product | null>(null);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<Product[]>([]);
	const [formData, setFormData] = useState<AdjustmentForm>({
		productId: "",
		quantity: 0,
		reason: "correction",
		notes: "",
	});

	React.useEffect(() => {
		setTitle("Stock Adjustment");
	}, [setTitle]);

	const handleSearch = async (query: string) => {
		setSearchQuery(query);
		if (query.length < 2) {
			setSearchResults([]);
			return;
		}

		try {
			const results = await ProductRepository.search(query);
			setSearchResults(results);
		} catch (error) {
			console.error("Error searching products:", error);
			setError("Failed to search products");
		}
	};

	const selectProduct = (product: Product) => {
		setProduct(product);
		setFormData((prev) => ({ ...prev, productId: product.id }));
		setSearchResults([]);
		setSearchQuery("");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		if (!product || !formData.quantity) {
			setError("Please select a product and enter a quantity");
			return;
		}

		try {
			await ProductRepository.updateStock(
				formData.productId,
				formData.quantity
			);

			// Refresh product data
			const updatedProduct = await ProductRepository.findById(
				formData.productId
			);
			if (updatedProduct) {
				setProduct(updatedProduct);
			}

			setSuccess("Stock adjusted successfully");
			// Reset form except for the selected product
			setFormData((prev) => ({
				...prev,
				quantity: 0,
				notes: "",
			}));
		} catch (error) {
			console.error("Error adjusting stock:", error);
			setError("Failed to adjust stock");
		}
	};

	return (
		<div>
			<button
				onClick={() => navigate("/products")}
				className="mb-6 flex items-center text-slate-600 hover:text-slate-900"
			>
				<ChevronLeft size={16} className="mr-1" />
				Back to Products
			</button>

			<div className="card p-6">
				<h2 className="text-2xl font-bold mb-6">Stock Adjustment</h2>

				{error && (
					<div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md">
						{error}
					</div>
				)}

				{success && (
					<div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
						{success}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Product Search */}
					<div>
						<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
							Search Product
						</label>
						<div className="relative">
							<input
								type="text"
								placeholder="Search by name or barcode..."
								value={searchQuery}
								onChange={(e) => handleSearch(e.target.value)}
								className="input"
							/>
							{searchResults.length > 0 && (
								<div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-64 overflow-auto">
									{searchResults.map((result) => (
										<button
											key={result.id}
											type="button"
											onClick={() =>
												selectProduct(result)
											}
											className="w-full text-left px-4 py-2 hover:bg-slate-50 flex justify-between items-center"
										>
											<div>
												<p className="font-medium">
													{result.name}
												</p>
												<p className="text-sm text-slate-500">
													{result.barcode &&
														`SKU: ${result.barcode}`}
												</p>
											</div>
											<span className="badge bg-slate-100 text-slate-700">
												Stock: {result.stock}
											</span>
										</button>
									))}
								</div>
							)}
						</div>
					</div>

					{product && (
						<>
							{/* Selected Product Info */}
							<div className="bg-slate-50 p-4 rounded-md">
								<h3 className="font-medium mb-2">
									{product.name}
								</h3>
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<p className="text-slate-500">
											Current Stock
										</p>
										<p className="font-medium">
											{product.stock} units
										</p>
									</div>
									<div>
										<p className="text-slate-500">SKU</p>
										<p className="font-medium">
											{product.barcode || "N/A"}
										</p>
									</div>
								</div>
							</div>

							{/* Adjustment Details */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
										Quantity
									</label>
									<input
										type="number"
										value={formData.quantity || ""}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												quantity:
													parseInt(e.target.value) ||
													0,
											}))
										}
										className="input"
										placeholder="Enter quantity (positive to add, negative to remove)"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
										Reason
									</label>
									<select
										value={formData.reason}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												reason: e.target
													.value as AdjustmentReason,
											}))
										}
										className="input"
									>
										<option value="correction">
											Stock Correction
										</option>
										<option value="returns">
											Customer Returns
										</option>
										<option value="shrinkage">
											Shrinkage/Loss
										</option>
										<option value="restock">Restock</option>
									</select>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
									Notes
								</label>
								<textarea
									value={formData.notes}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											notes: e.target.value,
										}))
									}
									className="input resize-none"
									rows={3}
									placeholder="Enter any additional notes about this adjustment"
								/>
							</div>

							{/* Preview */}
							{formData.quantity !== 0 && (
								<div className="bg-primary-50 p-4 rounded-md">
									<p className="font-medium mb-2">
										Adjustment Preview
									</p>
									<p className="text-sm">
										Current Stock: {product.stock} →{" "}
										<span
											className={
												formData.quantity > 0
													? "text-green-600"
													: "text-error-600"
											}
										>
											{product.stock + formData.quantity}
										</span>{" "}
										units
									</p>
								</div>
							)}
						</>
					)}

					{/* Form Actions */}
					<div className="flex justify-end space-x-3 pt-4 border-t">
						<button
							type="submit"
							disabled={!product || formData.quantity === 0}
							className="btn btn-primary"
						>
							<Save size={18} className="mr-1" />
							Save Adjustment
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default StockAdjustmentsPage;
