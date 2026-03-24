document.addEventListener('DOMContentLoaded', () => {
	const form = document.querySelector('.invoice-form');

	if (!form) return;

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		const subject = document.getElementById('subject')?.value || '';
		const dueDate = document.getElementById('dueDate')?.value || '';
		const currency = document.getElementById('currency')?.value || '';

		const qtyInput = form.querySelector('.qty-input');
		const qty = qtyInput ? Number(qtyInput.value || '1') : 1;

		const invoicePayload = {
			subject,
			dueDate,
			currency,
			items: [
				{
					description: 'Summer 2K23 T-shirt',
					quantity: qty,
					unitPrice: 125000,
					currencyCode: 'IDR',
				},
			],
		};

		try {
			const response = await fetch('http://localhost:4000/api/invoices', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(invoicePayload),
			});

			if (!response.ok) {
				console.error('Failed to save invoice', await response.text());
				alert('Error saving invoice to backend');
				return;
			}

			const saved = await response.json();
			console.log('Saved invoice:', saved);
			alert('Invoice saved with ID: ' + saved.id);
		} catch (error) {
			console.error('Request error', error);
			alert('Could not reach backend. Is it running on port 4000?');
		}
	});
});
