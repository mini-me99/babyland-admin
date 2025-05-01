"use client"

import { useState, useEffect } from "react"
import { createClientSupabaseClient } from "@/lib/supabase"

export default function DebugDatabasePage() {
  const [results, setResults] = useState<any>({
    loading: true,
    error: null,
    connectionInfo: null,
    products: null,
    orders: null,
    testInsert: null,
    testDelete: null,
  })

  useEffect(() => {
    async function runTests() {
      try {
        const supabase = createClientSupabaseClient()
        const results: any = {
          loading: false,
          error: null,
          connectionInfo: {},
          products: null,
          orders: null,
          testInsert: null,
          testDelete: null,
        }

        // Test 1: Check connection info
        results.connectionInfo = {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          timestamp: new Date().toISOString(),
        }

        // Test 2: Try to fetch products
        try {
          const { data: products, error } = await supabase.from("products").select("id, name").limit(5)

          results.products = {
            success: !error,
            error: error ? error.message : null,
            count: products?.length || 0,
            data: products,
          }
        } catch (err: any) {
          results.products = {
            success: false,
            error: err.message,
            count: 0,
            data: null,
          }
        }

        // Test 3: Try to fetch orders
        try {
          const { data: orders, error } = await supabase.from("orders").select("id, customer_name, created_at").limit(5)

          results.orders = {
            success: !error,
            error: error ? error.message : null,
            count: orders?.length || 0,
            data: orders,
          }
        } catch (err: any) {
          results.orders = {
            success: false,
            error: err.message,
            count: 0,
            data: null,
          }
        }

        // Test 4: Try to insert a test product
        try {
          const testProduct = {
            name: `Test Product ${Date.now()}`,
            price: 1,
            quantity: 1,
            barcode: `TEST-${Date.now()}`,
          }

          const { data: inserted, error } = await supabase.from("products").insert(testProduct).select()

          results.testInsert = {
            success: !error,
            error: error ? error.message : null,
            data: inserted,
          }

          // Test 5: Delete the test product if it was inserted
          if (!error && inserted && inserted.length > 0) {
            const { error: deleteError } = await supabase.from("products").delete().eq("id", inserted[0].id)

            results.testDelete = {
              success: !deleteError,
              error: deleteError ? deleteError.message : null,
            }
          }
        } catch (err: any) {
          results.testInsert = {
            success: false,
            error: err.message,
            data: null,
          }
        }

        setResults(results)
      } catch (err: any) {
        setResults({
          loading: false,
          error: err.message,
          connectionInfo: null,
          products: null,
          orders: null,
          testInsert: null,
          testDelete: null,
        })
      }
    }

    runTests()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Database Connection Diagnostics</h1>

      {results.loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : results.error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p>{results.error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Connection Info */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Connection Info</h2>
            <div className="bg-gray-100 p-3 rounded">
              <p>
                <strong>URL:</strong> {results.connectionInfo?.url || "Not set"}
              </p>
              <p>
                <strong>Has Anon Key:</strong> {results.connectionInfo?.hasAnonKey ? "Yes" : "No"}
              </p>
              <p>
                <strong>Timestamp:</strong> {results.connectionInfo?.timestamp}
              </p>
            </div>
          </div>

          {/* Products Test */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Products Test</h2>
            {results.products?.success ? (
              <div className="bg-green-100 p-3 rounded mb-3">
                <p className="text-green-700">✅ Successfully connected to products table</p>
                <p>Found {results.products.count} products</p>
              </div>
            ) : (
              <div className="bg-red-100 p-3 rounded mb-3">
                <p className="text-red-700">❌ Failed to connect to products table</p>
                <p>{results.products?.error}</p>
              </div>
            )}

            {results.products?.data && results.products.data.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Sample Products:</h3>
                <ul className="list-disc pl-5">
                  {results.products.data.map((product: any) => (
                    <li key={product.id}>{product.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Orders Test */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Orders Test</h2>
            {results.orders?.success ? (
              <div className="bg-green-100 p-3 rounded mb-3">
                <p className="text-green-700">✅ Successfully connected to orders table</p>
                <p>Found {results.orders.count} orders</p>
              </div>
            ) : (
              <div className="bg-red-100 p-3 rounded mb-3">
                <p className="text-red-700">❌ Failed to connect to orders table</p>
                <p>{results.orders?.error}</p>
              </div>
            )}

            {results.orders?.data && results.orders.data.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Sample Orders:</h3>
                <ul className="list-disc pl-5">
                  {results.orders.data.map((order: any) => (
                    <li key={order.id}>
                      {order.customer_name} - {new Date(order.created_at).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Write Test */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Write Test</h2>
            {results.testInsert?.success ? (
              <div className="bg-green-100 p-3 rounded mb-3">
                <p className="text-green-700">✅ Successfully inserted test product</p>
              </div>
            ) : (
              <div className="bg-red-100 p-3 rounded mb-3">
                <p className="text-red-700">❌ Failed to insert test product</p>
                <p>{results.testInsert?.error}</p>
              </div>
            )}

            {results.testDelete?.success ? (
              <div className="bg-green-100 p-3 rounded">
                <p className="text-green-700">✅ Successfully deleted test product</p>
              </div>
            ) : (
              results.testDelete && (
                <div className="bg-red-100 p-3 rounded">
                  <p className="text-red-700">❌ Failed to delete test product</p>
                  <p>{results.testDelete?.error}</p>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}
