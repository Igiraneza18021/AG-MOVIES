import { NextResponse } from "next/server"

// Simple proxy to stream remote video content with Range support for specific hosts
// Security: restrict to known hosts (terabox)

function isAllowedHost(targetUrl: URL) {
  const hostname = targetUrl.hostname.toLowerCase()
  return hostname.endsWith("terabox.com") || hostname.endsWith("1024terabox.com") || hostname.endsWith("terabox.app")
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")
  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 })

  let target: URL
  try {
    target = new URL(url)
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 })
  }

  if (!isAllowedHost(target)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 400 })
  }

  const incomingRange = request.headers.get("range") || undefined

  try {
    const upstream = await fetch(target.toString(), {
      method: "GET",
      headers: {
        ...(incomingRange ? { Range: incomingRange } : {}),
        // Some CDNs require a UA
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        Accept: "*/*",
        Referer: `${target.protocol}//${target.host}/`,
      },
      redirect: "follow",
    })

    const headers = new Headers()
    // Pass through relevant headers
    const contentType = upstream.headers.get("content-type")
    const acceptRanges = upstream.headers.get("accept-ranges")
    const contentRange = upstream.headers.get("content-range")
    const contentLength = upstream.headers.get("content-length")

    if (contentType) headers.set("content-type", contentType)
    if (acceptRanges) headers.set("accept-ranges", acceptRanges)
    if (contentRange) headers.set("content-range", contentRange as string)
    if (contentLength) headers.set("content-length", contentLength as string)

    // CORS for client playback
    headers.set("access-control-allow-origin", "*")

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    })
  } catch (e) {
    return NextResponse.json({ error: "Upstream fetch failed" }, { status: 502 })
  }
}


