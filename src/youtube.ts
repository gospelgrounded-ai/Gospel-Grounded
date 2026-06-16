import fetch from "node-fetch";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export interface YouTubeVideo {
  id: string;
  title: string;
  channelId: string;
  channelTitle: string;
  description: string;
  tags: string[];
  viewCount: string;
  likeCount: string;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  subscriberCount: string;
  videoCount: string;
  customUrl?: string;
}

function apiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY is not set in .env");
  return key;
}

export async function searchVideos(query: string, maxResults = 10): Promise<YouTubeVideo[]> {
  const key = apiKey();
  const searchUrl =
    `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodeURIComponent(query)}` +
    `&type=video&maxResults=${maxResults}&key=${key}`;

  const searchRes = await fetch(searchUrl);
  const searchData = (await searchRes.json()) as any;

  const videoIds: string = (searchData.items ?? [])
    .map((item: any) => item.id.videoId)
    .filter(Boolean)
    .join(",");

  if (!videoIds) return [];

  const statsUrl =
    `${YOUTUBE_API_BASE}/videos?part=snippet,statistics&id=${videoIds}&key=${key}`;
  const statsRes = await fetch(statsUrl);
  const statsData = (await statsRes.json()) as any;

  return (statsData.items ?? []).map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    channelId: item.snippet.channelId,
    channelTitle: item.snippet.channelTitle,
    description: item.snippet.description ?? "",
    tags: item.snippet.tags ?? [],
    viewCount: item.statistics?.viewCount ?? "0",
    likeCount: item.statistics?.likeCount ?? "0",
  }));
}

export async function getChannelDetails(channelIds: string[]): Promise<YouTubeChannel[]> {
  if (channelIds.length === 0) return [];
  const key = apiKey();
  const url =
    `${YOUTUBE_API_BASE}/channels?part=snippet,statistics&id=${channelIds.join(",")}&key=${key}`;

  const res = await fetch(url);
  const data = (await res.json()) as any;

  return (data.items ?? []).map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description ?? "",
    subscriberCount: item.statistics?.subscriberCount ?? "0",
    videoCount: item.statistics?.videoCount ?? "0",
    customUrl: item.snippet.customUrl,
  }));
}
