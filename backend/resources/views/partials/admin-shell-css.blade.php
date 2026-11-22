<style>
/* Shared admin shell: sidebar navigation used by both the management panel and the content workspace */
.admin-nav{display:grid;gap:2px}
.admin-nav .nav-group{margin:18px 12px 6px;font:700 12px/1.4 Cairo,Tahoma,sans-serif;color:#8a937f;letter-spacing:0}
.admin-nav .nav-group:first-child{margin-top:4px}
.admin-nav .nav-item{position:relative;display:flex;align-items:center;gap:11px;min-height:40px;padding:7px 12px;border:0;border-radius:9px;color:#4a5543;background:transparent;text-decoration:none;font:600 14.5px/1.4 Cairo,Tahoma,sans-serif;box-shadow:none;transition:background .15s,color .15s}
.admin-nav .nav-item .ico{flex:none;width:19px;height:19px;color:#8f9a84;transition:color .15s}
.admin-nav .nav-item:hover{background:#f3f6ee;color:#1e2918}.admin-nav .nav-item:hover .ico{color:#5f8f1f}
.admin-nav .nav-item[aria-current=page]{background:#eef4e2;color:#3f6510;font-weight:700;box-shadow:none}
.admin-nav .nav-item[aria-current=page]:before{content:"";position:absolute;inset-block:8px;inset-inline-start:-12px;width:3px;border-radius:3px 0 0 3px;background:#5f8f1f}
.admin-nav .nav-item[aria-current=page] .ico{color:#5f8f1f}
</style>
