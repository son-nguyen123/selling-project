'use client'

export default function SortDropdown({
  sort,
  search,
  category,
}: {
  sort: string
  search: string
  category: string
}) {
  return (
    <form action="/" method="get" className="inline">
      <input type="hidden" name="search" value={search} />
      <input type="hidden" name="category" value={category} />
      <select
        name="sort"
        defaultValue={sort}
        onChange={(e) => e.target.form?.submit()}
        className="bg-card text-foreground border border-border rounded-lg px-4 py-2"
      >
        <option value="featured">Featured</option>
        <option value="latest">Latest</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
      </select>
    </form>
  )
}
