const ngn = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });
/** amount in naira (convert from kobo before calling) -> "₦2,125,988" */
export const naira = (n: number) => ngn.format(n);
