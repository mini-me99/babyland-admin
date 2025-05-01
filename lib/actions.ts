"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "./supabase"
import { generateBarcodeNumber } from "./utils"

// Admin Login
export async function adminLogin(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (username === "admin" && password === "1980") {
    document.cookie = "admin_authenticated=true; path=/; max-age=86400" // 1 day
    revalidatePath("/admin")
    redirect("/admin/dashboard")
    return { success: true }
  } else {
    return { error: "اسم المستخدم أو كلمة المرور غير صحيحة" }
  }
}

// إضافة منتج جديد
export async function addProduct(formData: FormData) {
  try {
    const supabase = createServerSupabaseClient()

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const quantity = Number.parseInt(formData.get("quantity") as string)
    const price = Number.parseFloat((formData.get("price") as string) || "0")
    const imageFile = formData.get("image") as File

    // التحقق من صحة البيانات
    if (!name || isNaN(quantity)) {
      return { error: "بيانات غير صالحة" }
    }

    // إنشاء باركود فريد
    const barcode = generateBarcodeNumber()

    let imageUrl = ""

    // رفع الصورة إلى Supabase Storage إذا كانت موجودة
    if (imageFile && imageFile.size > 0) {
      try {
        // التحقق من وجود الـ bucket أو إنشاؤه
        const { data: buckets } = await supabase.storage.listBuckets()
        const bucketExists = buckets?.some((bucket) => bucket.name === "products")

        if (!bucketExists) {
          // إنشاء bucket جديد إذا لم يكن موجودًا
          const { error: createBucketError } = await supabase.storage.createBucket("products", {
            public: true,
            fileSizeLimit: 5242880, // 5MB
          })

          if (createBucketError) {
            console.error("خطأ في إنشاء bucket:", createBucketError)
            // المتابعة بدون صورة إذا فشل إنشاء الـ bucket
            imageUrl = ""
            return { error: "فشل في إنشاء مجلد التخزين. سيتم إضافة المنتج بدون صورة." }
          }
        }

        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${Date.now()}.${fileExt}`

        // تحويل الملف إلى مصفوفة بايت
        const arrayBuffer = await imageFile.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, buffer, {
            contentType: imageFile.type,
          })

        if (uploadError) {
          console.error("خطأ في رفع الصورة:", uploadError)
          // المتابعة بدون صورة
          imageUrl = ""
        } else {
          // الحصول على URL العام للصورة
          const {
            data: { publicUrl },
          } = supabase.storage.from("products").getPublicUrl(fileName)

          imageUrl = publicUrl
        }
      } catch (err) {
        console.error("خطأ في معالجة الصورة:", err)
        // المتابعة بدون صورة
        imageUrl = ""
      }
    }

    // إضافة المنتج إلى قاعدة البيانات
    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name,
          description,
          quantity,
          price,
          image_url: imageUrl,
          barcode,
        },
      ])
      .select()

    if (error) {
      console.error("خطأ في إضافة المنتج:", error)
      return { error: "فشل في إضافة المنتج" }
    }

    revalidatePath("/products")
    return { success: true, product: data[0] }
  } catch (err) {
    console.error("خطأ غير متوقع:", err)
    return { error: "حدث خطأ غير متوقع" }
  }
}

// تحديث منتج
export async function updateProduct(formData: FormData) {
  try {
    const supabase = createServerSupabaseClient()

    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const quantity = Number.parseInt(formData.get("quantity") as string)
    const price = Number.parseFloat((formData.get("price") as string) || "0")
    const imageFile = formData.get("image") as File

    const updateData: any = {
      name,
      description,
      quantity,
      price,
      updated_at: new Date().toISOString(),
    }

    // رفع الصورة الجديدة إذا تم تحديدها
    if (imageFile && imageFile.size > 0) {
      try {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${Date.now()}.${fileExt}`

        // تحويل الملف إلى مصفوفة بايت
        const arrayBuffer = await imageFile.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, buffer, {
            contentType: imageFile.type,
          })

        if (uploadError) {
          console.error("خطأ في رفع الصورة:", uploadError)
        } else {
          // الحصول على URL العام للصورة
          const {
            data: { publicUrl },
          } = supabase.storage.from("products").getPublicUrl(fileName)

          updateData.image_url = publicUrl
        }
      } catch (err) {
        console.error("خطأ في معالجة الصورة:", err)
      }
    }

    // تحديث المنتج في قاعدة البيانات
    const { data, error } = await supabase.from("products").update(updateData).eq("id", id).select()

    if (error) {
      return { error: "فشل في تحديث المنتج" }
    }

    revalidatePath("/products")
    return { success: true, product: data[0] }
  } catch (err) {
    console.error("خطأ غير متوقع:", err)
    return { error: "حدث خطأ غير متوقع" }
  }
}

// حذف منتج
export async function deleteProduct(id: string) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    return { error: "فشل في حذف المنتج" }
  }

  revalidatePath("/products")
  return { success: true }
}

// تحديث حالة الطلب
export async function updateOrderStatus(id: string, formData: FormData) {
  const supabase = createServerSupabaseClient()
  const status = formData.get("status") as string

  const { error } = await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id)

  if (error) {
    return { error: "فشل في تحديث حالة الطلب" }
  }

  revalidatePath("/orders")
  return { success: true }
}

// إنشاء طلب جديد
export async function createOrder(formData: FormData) {
  try {
    const supabase = createServerSupabaseClient()

    const customerName = formData.get("customerName") as string
    const storeName = formData.get("storeName") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string
    const deposit = Number(formData.get("deposit") || 0)
    const shippingCompany = formData.get("shippingCompany") as string
    const deliveryDate = formData.get("deliveryDate") as string
    const paymentMethod = formData.get("paymentMethod") as string
    const paymentScreenshot = formData.get("paymentScreenshot") as File
    const cartItemsString = formData.get("cartItems") as string
    const cartItems = JSON.parse(cartItemsString)

    // Validate required fields
    if (!customerName || !phone || !address) {
      return { error: "الرجاء ملء جميع الحقول المطلوبة." }
    }

    // Validate payment screenshot if Instapay is selected
    if (paymentMethod === "إنستا باي" && !paymentScreenshot) {
      return { error: "الرجاء تحميل صورة إيصال الدفع." }
    }

    let paymentScreenshotUrl = null

    // Upload payment screenshot if provided
    if (paymentScreenshot && paymentScreenshot.size > 0) {
      const fileExt = paymentScreenshot.name.split(".").pop()
      const fileName = `payment-${Date.now()}.${fileExt}`

      // Convert file to byte array
      const arrayBuffer = await paymentScreenshot.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("payments")
        .upload(fileName, buffer, {
          contentType: paymentScreenshot.type,
        })

      if (uploadError) {
        console.error("Error uploading payment screenshot:", uploadError)
        return { error: "فشل في رفع صورة إيصال الدفع." }
      }

      // Get public URL of the image
      const {
        data: { publicUrl },
      } = supabase.storage.from("payments").getPublicUrl(fileName)

      paymentScreenshotUrl = publicUrl
    }

    // Generate a unique order number
    const orderNumber = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0")

    // Create the order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          customer_name: customerName,
          store_name: storeName,
          phone: phone,
          address: address,
          deposit: deposit,
          shipping_company: shippingCompany,
          delivery_date: deliveryDate,
          payment_method: paymentMethod,
          payment_screenshot_url: paymentScreenshotUrl,
          order_number: orderNumber,
          status: "جديد", // Default status
        },
      ])
      .select()

    if (orderError) {
      console.error("Error creating order:", orderError)
      return { error: "فشل في إنشاء الطلب." }
    }

    const order = orderData[0]

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }))

    const { error: orderItemsError } = await supabase.from("order_items").insert(orderItems)

    if (orderItemsError) {
      console.error("Error creating order items:", orderItemsError)
      return { error: "فشل في إنشاء عناصر الطلب." }
    }

    revalidatePath("/cart")
    return { success: true, orderId: order.id, orderNumber: orderNumber }
  } catch (err: any) {
    console.error("Unexpected error:", err)
    return { error: "حدث خطأ غير متوقع." }
  }
}
