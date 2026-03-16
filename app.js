import express from "express";
import axios from "axios";
import { fileURLToPath } from "url";

const app = express();

app.get("/", (req, res) => {
  res.sendFile(fileURLToPath(new URL("./index.html", import.meta.url)));
});

app.get("/api/subtitle", async (req, res) => {
  try {
    let { url } = req.query;
    const decodedUrl = decodeURIComponent(url);
    const linkMatch = decodedUrl.match(/(https?:\/\/[^\s]+)/);
    url = linkMatch[0]; // 1. 解析短链并提取 BVID

    if (url.includes("b23.tv")) {
      const jumpRes = await axios.get(url, {
        maxRedirects: 0,
        validateStatus: () => true,
      });
      url = jumpRes.headers.location || url;
    }
    const bvid = url.match(/BV[\da-zA-Z]{10}/i)?.[0]; // 2. 获取视频基础信息 (cid, title)

    const {
      data: {
        data: { cid, title },
      },
    } = await axios.get(
      `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`,
    );

    // 3. 直接请求弹幕接口提取字幕列表 (策略 B)
    const { data: dm } = await axios.get(
      `https://api.bilibili.com/x/v2/dm/view?type=1&oid=${cid}&bvid=${bvid}`,
    );
    let subList = dm.data?.subtitle?.subtitles || []; // 4. 获取真实的 JSON 链接并请求数据

    let subUrl = subList.find((s) => s.subtitle_url)?.subtitle_url;

    const { data: subtitleData } = await axios.get(subUrl); // 5. 提取纯文本并返回 JSON
    const subtitles = (subtitleData.body || [])
      .map((item) => item.content?.trim())
      .filter(Boolean);

    res.json({
      title,
      bvid,
      cid,
      subtitles,
    });
  } catch (error) {
    res.status(500).json({ error: "获取字幕失败", msg: error.message });
  }
});

app.listen(3000, () => {
  console.log(
    "服务器已启动，访问 https://7yaz1.cn/api/subtitle?url=你的B站视频短链接",
  );
});
