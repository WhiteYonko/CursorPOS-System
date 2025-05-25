import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash, RefreshCw } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useDatabase } from "../../context/DatabaseContext";
import {
	ProductRepository,
	ProductFilter,
} from "../../data/repositories/ProductRepository";
import { Product } from "../../data/models/Product";
import { ProductSearchFilters } from "../../components/products/ProductSearchFilters";

function ProductsPage() {
	const { setTitle } = useApp();
	const { isInitialized: dbIsInitialized } = useDatabase();
	const navigate = useNavigate();

	const [products, setProducts] = useState<Product[]>([]);
	const [filters, setFilters] = useState<ProductFilter>({});
	const [sortBy, setSortBy] = useState<"name" | "stock" | "price">("name");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
	const [showDeleted, setShowDeleted] = useState(false);

	useEffect(() => {
		setTitle("Products");
		if (dbIsInitialized) {
			loadProducts();
		}
	}, [setTitle, dbIsInitialized, filters]);

	const loadProducts = async () => {
		try {
			const searchResults = await ProductRepository.searchProducts(
				filters
			);
			let result = [...searchResults];

			// Filter by deleted status
			if (!showDeleted) {
				result = result.filter((p) => !p.isDeleted);
			}

			// Apply sorting
			result.sort((a, b) => {
				let comparison = 0;

				if (sortBy === "name") {
					comparison = a.name.localeCompare(b.name);
				} else if (sortBy === "stock") {
					comparison = (a.stock || 0) - (b.stock || 0);
				} else if (sortBy === "price") {
					comparison = a.price - b.price;
				}

				return sortDirection === "asc" ? comparison : -comparison;
			});

			setProducts(result);
		} catch (error) {
			console.error("Error loading products:", error);
		}
	};

	const handleEditProduct = (id: string) => {
		navigate(`/products/${id}`);
	};

	const handleDeleteProduct = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this product?")) {
			try {
				await ProductRepository.delete(id);
				await loadProducts();
			} catch (error) {
				console.error("Error deleting product:", error);
			}
		}
	};

	const handleRestoreProduct = async (id: string) => {
		try {
			await ProductRepository.restore(id);
			await loadProducts();
		} catch (error) {
			console.error("Error restoring product:", error);
		}
	};

	const toggleSort = (field: "name" | "stock" | "price") => {
		if (sortBy === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortBy(field);
			setSortDirection("asc");
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Header section */}
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold dark:text-white">Products</h1>
				<div className="space-x-2">
					<button
						onClick={() => navigate("/products/new")}
						className="btn-primary"
					>
						<Plus className="w-4 h-4 mr-2" />
						Add Product
					</button>
				</div>
			</div>

			{/* Search and filters */}
			<ProductSearchFilters onFiltersChange={setFilters} />

			{/* Sort and view options */}
			<div className="flex justify-between items-center mb-4">
				<div className="flex items-center space-x-4">
					<select
						value={sortBy}
						onChange={(e) =>
							setSortBy(
								e.target.value as "name" | "stock" | "price"
							)
						}
						className="select-input"
					>
						<option value="name">Sort by Name</option>
						<option value="stock">Sort by Stock</option>
						<option value="price">Sort by Price</option>
					</select>
					<button
						onClick={() =>
							setSortDirection(
								sortDirection === "asc" ? "desc" : "asc"
							)
						}
						className="btn-secondary"
					>
						{sortDirection === "asc" ? "Ascending" : "Descending"}
					</button>
					<button
						onClick={() => setShowDeleted(!showDeleted)}
						className={`btn-secondary ${
							showDeleted ? "bg-gray-600" : ""
						}`}
					>
						Show Deleted
					</button>
				</div>
				<button onClick={loadProducts} className="btn-secondary">
					<RefreshCw className="w-4 h-4 mr-2" />
					Refresh
				</button>
			</div>

			{/* Products table */}
			<div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
				<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
					<thead className="bg-gray-50 dark:bg-gray-700">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Name
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Category
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Stock
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Price
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
						{products.map((product) => (
							<tr
								key={product.id}
								className={`${
									product.isDeleted
										? "bg-red-50 dark:bg-red-900/20"
										: ""
								}`}
							>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="flex items-center">
										<div>
											<div className="text-sm font-medium text-gray-900 dark:text-white">
												{product.name}
											</div>
											{product.sku && (
												<div className="text-sm text-gray-500 dark:text-gray-400">
													SKU: {product.sku}
												</div>
											)}
											{product.barcode && (
												<div className="text-sm text-gray-500 dark:text-gray-400">
													Barcode: {product.barcode}
												</div>
											)}
										</div>
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-900 dark:text-white">
										{product.category || "-"}
									</div>
									{product.supplier && (
										<div className="text-sm text-gray-500 dark:text-gray-400">
											{product.supplier}
										</div>
									)}
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
											(product.stock || 0) <= 0
												? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
												: (product.stock || 0) <= 5
												? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
												: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
										}`}
									>
										{product.stock || 0}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
									${product.price.toFixed(2)}
								</td>{" "}
								<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
									<div className="flex space-x-2">
										{!product.isDeleted ? (
											<>
												<button
													onClick={() =>
														navigate(
															`/products/edit/${product.id}`
														)
													}
													className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
													title="Edit product"
												>
													<Edit className="w-4 h-4" />
												</button>
												<button
													onClick={() =>
														handleDeleteProduct(
															product.id
														)
													}
													className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
													title="Delete product"
												>
													<Trash className="w-4 h-4" />
												</button>
											</>
										) : (
											<button
												onClick={() =>
													handleRestoreProduct(
														product.id
													)
												}
												className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
												title="Restore product"
											>
												<RefreshCw className="w-4 h-4" />
											</button>
										)}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default ProductsPage;
