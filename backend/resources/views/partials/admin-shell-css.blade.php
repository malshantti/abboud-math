<style>
/* Shared admin shell: sidebar navigation used by both the management panel and the content workspace */
.admin-nav{display:grid;gap:4px}
.admin-nav .nav-group{margin:16px 12px 4px;font:800 13px/1.4 Cairo,Tahoma,sans-serif;color:#8a957f;letter-spacing:0}
.admin-nav .nav-group:first-child{margin-top:4px}
.admin-nav .nav-item{display:flex;align-items:center;gap:12px;min-height:46px;padding:9px 14px;border:2px solid transparent;border-radius:14px;color:#4c5a43;background:transparent;text-decoration:none;font:700 16px/1.4 Cairo,Tahoma,sans-serif;box-shadow:none;transition:background .15s,color .15s}
.admin-nav .nav-item .ico{flex:none;width:22px;height:22px;color:#89b53a}
.admin-nav .nav-item:hover{background:#f3f7ec;color:#24331c}
.admin-nav .nav-item[aria-current=page]{background:#eef5dc;border-color:#cfe3a8;color:#507a12;box-shadow:0 3px 0 #cfe3a8;font-weight:800}
.admin-nav .nav-item[aria-current=page] .ico{color:#6f9e23}
</style>
