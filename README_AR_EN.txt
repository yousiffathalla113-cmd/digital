
SKY 7 — MENU + ORDERING + CASHIER PROTOTYPE
===========================================

This project is based on the uploaded SKY 7 multi-page menu ZIP. It keeps the separate Italian, Versailles/French, SKY 7, Room Service and Beverages pages, and adds ordering/cart controls plus a cashier screen.

RUN LOCALLY (Windows)
1. Install Node.js 18+ from https://nodejs.org/
2. Extract the ZIP.
3. Open the extracted folder; type cmd in the File Explorer address bar and press Enter.
4. Run: node server.js
5. On the same computer open:
   Guest home: http://localhost:3000
   Cashier:    http://localhost:3000/cashier.html
6. To test on a tablet, connect it and the computer to the same trusted Wi-Fi network.
   Run ipconfig in Command Prompt, find the computer's IPv4 address, then open
   http://COMPUTER-IP:3000 on the tablet. Example only: http://192.168.1.20:3000

WHAT'S INCLUDED
- Separate pages from the supplied menu.
- Add-to-order buttons and cart.
- Service location field (room/table/bar/pool/other).
- Submit order to a local Node.js server.
- Cashier dashboard that refreshes every 2.5 seconds.
- Status updates: New → Preparing → Ready → Delivered.
- Orders stored in data/orders.json.

IMPORTANT BEFORE REAL HOTEL USE
- This is a prototype, not a production-ready hotel system.
- No staff login, user roles, TLS/HTTPS, audit log, backup service or hardened security.
- Do not expose it to the public internet or use for real guest orders before securing it.
- It does not integrate with an existing POS/PMS or automatically post to a room folio.
- Price ranges in the source menu are represented in the estimate using the first/lower number. Verify all pricing and any choices/options before live use.
- Some prices may have been supplied as LE or EGP; the checkout estimate displays LE consistently. Confirm the hotel's official currency display.
- Menu cards remain as provided; this prototype adds order controls and doesn't lock the tablet into kiosk mode.
- Orders are stored locally in a JSON file, suitable only for low-volume testing.
- A developer should add authentication, server-side catalog/price validation, database, backups, HTTPS, and POS/PMS integration before deployment.

CUSTOMIZATION
- Menu item source text lives in public/italian.html, public/french.html,
  public/sky7.html, public/room-service.html and public/beverages.html.
- Order/cart UI is in public/order.js.
- Cashier page is public/cashier.html and public/cashier.js.
- Styling is in public/style.css.
