$urls = @('http://localhost:3001/', 'http://localhost:3001/html/index.html', 'http://localhost:3001/api/agents', 'http://localhost:3001/html/planification.html', 'http://localhost:3001/html/prepa.html')
foreach ($u in $urls) {
    Write-Output "== $u =="
    try {
        $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 10
        Write-Output ("Status: {0}" -f $r.StatusCode)
        $t = $r.Content
        if ($t) {
            if ($t.Length -gt 400) { $t = $t.Substring(0, 400) + '...' }
            Write-Output $t
        }
    }
    catch {
        Write-Output ("ERROR: {0}" -f $_.Exception.Message)
    }
    Write-Output "",
}
