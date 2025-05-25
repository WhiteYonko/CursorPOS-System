import React, { useEffect, useState } from "react";
import {
	ProductFilter,
	ProductRepository,
	StockStatus,
} from "../../data/repositories/ProductRepository";

interface ProductSearchFiltersProps {
	onFiltersChange: (filters: ProductFilter) => void;
}

export const ProductSearchFilters: React.FC<ProductSearchFiltersProps> = ({
	onFiltersChange,
}) => {
	const [search, setSearch] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("");
	const [selectedSupplier, setSelectedSupplier] = useState("");
	const [selectedStockStatus, setSelectedStockStatus] = useState<
		StockStatus | ""
	>("");
	const [categories, setCategories] = useState<string[]>([]);
	const [suppliers, setSuppliers] = useState<string[]>([]);

	useEffect(() => {
		const loadFilters = async () => {
			const [categoryList, supplierList] = await Promise.all([
				ProductRepository.getCategories(),
				ProductRepository.getSuppliers(),
			]);
			setCategories(categoryList);
			setSuppliers(supplierList);
		};

		loadFilters();
	}, []);

	useEffect(() => {
		const filters: ProductFilter = {
			search: search || undefined,
			category: selectedCategory || undefined,
			supplier: selectedSupplier || undefined,
			stockStatus: (selectedStockStatus as StockStatus) || undefined,
		};
		onFiltersChange(filters);
	}, [
		search,
		selectedCategory,
		selectedSupplier,
		selectedStockStatus,
		onFiltersChange,
	]);

	return (
		<div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4 space-y-4">
			<div className="flex flex-wrap gap-4">
				{/* Search input */}
				<div className="flex-1 min-w-[200px]">
					<input
						type="text"
						placeholder="Search by name, SKU, or barcode..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
					/>
				</div>

				{/* Category filter */}
				<div className="w-48">
					<select
						value={selectedCategory}
						onChange={(e) => setSelectedCategory(e.target.value)}
						className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
					>
						<option value="">All Categories</option>
						{categories.map((category) => (
							<option key={category} value={category}>
								{category}
							</option>
						))}
					</select>
				</div>

				{/* Supplier filter */}
				<div className="w-48">
					<select
						value={selectedSupplier}
						onChange={(e) => setSelectedSupplier(e.target.value)}
						className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
					>
						<option value="">All Suppliers</option>
						{suppliers.map((supplier) => (
							<option key={supplier} value={supplier}>
								{supplier}
							</option>
						))}
					</select>
				</div>

				{/* Stock status filter */}
				<div className="w-48">
					<select
						value={selectedStockStatus}
						onChange={(e) =>
							setSelectedStockStatus(
								e.target.value as StockStatus | ""
							)
						}
						className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
					>
						<option value="">All Stock Status</option>
						<option value={StockStatus.InStock}>In Stock</option>
						<option value={StockStatus.LowStock}>Low Stock</option>
						<option value={StockStatus.OutOfStock}>
							Out of Stock
						</option>
					</select>
				</div>
			</div>
		</div>
	);
};
