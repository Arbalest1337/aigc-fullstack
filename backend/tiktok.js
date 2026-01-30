async function checkTikTokPostStatus(accessToken, publishId) {
    const url = 'https://open.tiktokapis.com/v2/post/publish/status/fetch/';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({
                publish_id: publishId
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('状态查询成功:', data.data);
            // 重点关注 data.data.status
            // 可能的状态值: "PUBLISHING", "FAILED", "SUCCESS"
            return data.data;
        } else {
            console.error('接口请求失败:', data.error);
        }
    } catch (error) {
        console.error('网络错误:', error);
    }
}


const accessToken= `act.vPnvQwVYhmPWYrn8O2WHnAHxKysKP275U4jI8tqHqZt6U8KxEVj3EWbqXYTT!6383.u1`
const publishId= `p_pub_url~v2.7589202955908466701`
checkTikTokPostStatus(accessToken, publishId)