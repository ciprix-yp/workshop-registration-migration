#!/bin/bash

# DNS Propagation Checker for formular.bizzclub-satumare.app

echo "🔍 Verificare DNS pentru formular.bizzclub-satumare.app"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if domain resolves
if host formular.bizzclub-satumare.app > /dev/null 2>&1; then
    echo "✅ DNS propagat cu succes!"
    echo ""
    echo "Detalii DNS:"
    host formular.bizzclub-satumare.app
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ Next Step: Verifică în Vercel Dashboard"
    echo "   → Mergi la: https://vercel.com/dashboard"
    echo "   → Settings → Domains"
    echo "   → Ar trebui să vezi: '✓ Valid Configuration'"
    echo ""
else
    echo "⏳ DNS încă nu s-a propagat"
    echo ""
    echo "Configurația CNAME pare corectă, doar așteaptă propagarea."
    echo ""
    echo "Timeframe obișnuit:"
    echo "  • Minim: 5-30 minute"
    echo "  • Normal: 1-2 ore"
    echo "  • Maxim: 48 ore"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "💡 Rulează din nou acest script peste 10-15 minute:"
    echo "   bash check-dns.sh"
    echo ""
fi
