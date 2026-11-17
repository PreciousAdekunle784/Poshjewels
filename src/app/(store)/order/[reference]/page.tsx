import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getViewableOrder } from "@/lib/order-view";
import { getSetting } from "@/lib/settings";
import { formatDateTime, formatNaira } from "@/lib/format";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };

type Props = { params: Promise<{ reference: string }>; searchParams: Promise<{ t?: string; payment?: string }> };

const STATUS_COPY: Record<string, string> = {
  pending: "Received",
  processing: "Being prepared",
  shipped: "On its way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default async function OrderPage({ params, searchParams }: Props) {
  const { reference } = await params;
  const { t, payment } = await searchParams;
  const data = await getViewableOrder(reference, t);
  if (!data) notFound();
  const { order, items } = data;
  const bank = await getSetting("bank");
  const awaitingTransfer = order.paymentMethod === "bank_transfer" && order.paymentStatus !== "paid" && order.status !== "cancelled";
  const cardFailed = order.paymentMethod === "paystack" && order.paymentStatus !== "paid";

  let headline = "Thank you. Your order is confirmed.";
  if (order.status === "cancelled") headline = "This order was cancelled.";
  else if (awaitingTransfer) headline = "Thank you. Your order is reserved.";
  else if (cardFailed) headline = "Your payment hasn't been confirmed yet.";

  return (
    <div className="wrap grid gap-12 pb-24 pt-10 lg:grid-cols-12 lg:pt-14">
      <div className="lg:col-span-7">
        <p className="label text-stone">Order {order.reference}</p>
        <h1 className="display mt-3 text-[36px] lg:text-[48px]">{headline}</h1>
        <p className="mt-4 max-w-[52ch] text-stone">
          {awaitingTransfer
            ? "Complete your bank transfer using the details below. We'll start preparing your order as soon as payment arrives."
            : cardFailed
              ? payment === "failed"
                ? "Paystack reported that the payment did not go through. You have not been charged for this order. Please try again from your bag or contact us."
                : "If you completed payment, it can take a moment to confirm. Refresh this page shortly. If you didn't complete payment, your items will be released after two hours."
              : `A summary is below. Keep your order reference, ${order.reference}, for any questions.`}
        </p>

        {awaitingTransfer && (
          <div className="mt-8 border border-espresso p-6">
            <h2 className="label">Bank transfer details</h2>
            {bank.accountNumber ? (
              <dl className="mt-4 grid gap-3 text-[15px] sm:grid-cols-[160px_1fr]">
                <dt className="text-stone">Amount</dt>
                <dd className="tabular text-[18px]">{formatNaira(order.total)}</dd>
                <dt className="text-stone">Bank</dt>
                <dd>{bank.bankName}</dd>
                <dt className="text-stone">Account name</dt>
                <dd>{bank.accountName}</dd>
                <dt className="text-stone">Account number</dt>
                <dd className="tabular text-[18px] tracking-wider">{bank.accountNumber}</dd>
                <dt className="text-stone">Reference</dt>
                <dd className="tabular">{order.reference}</dd>
              </dl>
            ) : (
              <p className="mt-3 text-[14.5px]">
                We&rsquo;ll contact you at {order.email} or {order.phone} with payment details. Please use <span className="tabular">{order.reference}</span> as your payment reference.
              </p>
            )}
            {bank.instructions && <p className="mt-5 border-t border-line pt-4 text-[13.5px] text-stone">{bank.instructions}</p>}
          </div>
        )}

        <dl className="mt-10 grid gap-6 border-t border-line pt-8 sm:grid-cols-2">
          <div>
            <dt className="label text-stone">Status</dt>
            <dd className="mt-1">{STATUS_COPY[order.status]}</dd>
          </div>
          <div>
            <dt className="label text-stone">Payment</dt>
            <dd className="mt-1">
              {order.paymentStatus === "paid" ? "Paid" : order.paymentStatus === "failed" ? "Failed" : "Awaiting payment"} ·{" "}
              {order.paymentMethod === "paystack" ? "Paystack" : "Bank transfer"}
            </dd>
          </div>
          <div>
            <dt className="label text-stone">Delivering to</dt>
            <dd className="mt-1 leading-relaxed">
              {order.firstName} {order.lastName}
              <br />
              {order.address}
              <br />
              {order.city}, {order.state}
              <br />
              {order.phone}
            </dd>
          </div>
          <div>
            <dt className="label text-stone">Placed</dt>
            <dd className="mt-1">{formatDateTime(order.createdAt)}</dd>
          </div>
        </dl>
      </div>

      <aside className="lg:col-span-5">
        <div className="bg-bone p-6">
          <h2 className="label">Summary</h2>
          <ul className="mt-5 divide-y divide-espresso/10">
            {items.map((it) => (
              <li key={it.id} className="flex gap-4 py-3">
                <div className="relative h-[72px] w-[58px] shrink-0 overflow-hidden bg-ivory">{it.imageUrl && <Image src={it.imageUrl} alt="" fill sizes="58px" className="object-cover" />}</div>
                <div className="min-w-0 flex-1 text-[14px]">
                  <p>{it.productName}</p>
                  <p className="text-[12.5px] text-stone">
                    {it.variantName ? `${it.variantName} · ` : ""}Qty {it.quantity}
                  </p>
                </div>
                <span className="tabular text-[14px]">{formatNaira(it.unitPrice * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 grid gap-2 border-t border-espresso/15 pt-4 text-[14.5px]">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="tabular">{formatNaira(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Delivery</dt>
              <dd className="tabular">{order.shippingFee === 0 ? "Free" : formatNaira(order.shippingFee)}</dd>
            </div>
            <div className="flex justify-between border-t border-espresso/15 pt-3 text-[17px]">
              <dt>Total</dt>
              <dd className="tabular">{formatNaira(order.total)}</dd>
            </div>
          </dl>
        </div>
        <Link href="/shop" className="link label mt-6 inline-block">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
