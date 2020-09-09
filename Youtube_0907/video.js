	// 單頁顯示的資料筆數
    const count_page = 6;
    // 頁面上限
    const page_max = 5;
    const app = Vue.createApp({
		data(){
			return {
				// 預設以發布日期作為排序依據
				currentSort:"snippet.publishedAt",

				// 預設尚未排序
				isSort: false,

				// 預設顯示播放清單
				isLikeList:false,

				// 預設收藏清單是空的
				isLike:false,

				isShow:false,

				// 預設沒被選擇
				isChoice:false,

				// 搜尋欄位未輸入資料
				searchTitle:'',
				videoData: [],
				currentPage:1
			}
		},
		created () {
			
			var url =
					// 目前使用
					"https://www.googleapis.com/youtube/v3/videos?" +
					"part=snippet,id,contentDetails"+
					"&chart=mostPopular&maxResults=100"+
					"&key=AIzaSyANiT18nS9RT0-torVr8FwzPYHPLe61a50";

					// 測試

					// "https://www.googleapis.com/youtube/v3/playlistItems?" +
					// "part=snippet,contentDetails"+
					// // "id=UC_XRq7JriAORvDe1lI1RAsA"+
					// "&playlistId=PLCI2CZySgOeLJbgxOs7DtnU6F7YvFObJa"+
					// "&key=AIzaSyC8Dq2_fJ5NI5iCVdZ_ZLEFsH6cegLegz0";
					// "&maxResults=50";
					
			fetch(url,{method:'get'})
				.then(res => res.json())
				.then(json => {
					console.log(json);
					const myvideo = Object.keys(json.items).map(key=>json.items[key]);
					this.videoData = myvideo;
			});
		},
		computed:{
			totalPage(){
				// 計算總頁數
				return Math.ceil(this.searchData.length / count_page);
				console.log("總頁數是:"+Math.ceil(this.searchData.length / count_page)+"頁");
			},
			pageEnd(){
				// 頁尾
				console.log("總頁數有:"+this.totalPage+"頁");
				return this.totalPage <= page_max
					? this.totalPage
					: page_max;
			},
			sortData(){
				// 排序資料
				const filterVideo = [...this.searchData];
				return this.isSort
					? filterVideo.sort((a, b) => b[this.currentSort] - a[this.currentSort])
					: filterVideo.sort((a, b) => a[this.currentSort] - b[this.currentSort]);
			},
			sliceData(){
				// 將找出來的資料作陣列分割
				const start = (this.currentPage - 1 )*count_page;
				const end = 
					start + count_page <= this.sortData.length
					? start + count_page
					: this.sortData.length;
				return this.sortData.slice(start,end);
			},
			searchData(){
				if(this.videoData.length===0){
					this.noData = true;
					return [];
				}else{
					this.noData = false;
					return this.videoData.filter(d => d.snippet.title.toUpperCase().includes(this.searchTitle.toUpperCase()));
				}
			},
			favoriteList(){
				return this.sortData.filter(d => d.isLike);
			},
			
			pageAddmount(){
				// 處理換頁頁數的位移
				const tmp = 
					this.totalPage <= page_max
					// 如果沒超過頁數的上限，那tmp等於0，頁面數字不再增加
					? 0
					: this.currentPage + 2 - this.pageEnd;
					return tmp <= 0
					// 當搜尋結果只有三筆資料，也就只有一頁那就不用做位移
					? 0
					: this.totalPage - ( page_max + tmp ) < 0
					? this.totalPage - page_max
					: tmp;
			}
		},
		methods:{
			timeFormat(val){
				// 處理播放時間的格式
				// var videoTime = val.match(/\d+/g);
		
				// if(videoTime.length===3){
				// 	if(videoTime[0] < 10){
				// 		videoTime[0] = "0"+videoTime[0];
				// 	}else{
				// 		videoTime[0] = videoTime[0];
				// 	}
				// 	if(videoTime[1] < 10){
				// 		videoTime[1] = "0"+videoTime[1];
				// 	}else{
				// 		videoTime[1] = videoTime[1];
				// 	}
				// 	if(videoTime[2] < 10){
				// 		videoTime[2] = "0"+videoTime[2];
				// 	}else{
				// 		videoTime[2] = videoTime[2];
				// 	}
				// 	return videoTime = videoTime[0] +":"+ videoTime[1] +":"+ videoTime[2];
				// }
				// else if(videoTime.length===2){
				// 	if(videoTime[0] < 10){
				// 		videoTime[0] = "0"+videoTime[0];
				// 	}else{
				// 		videoTime[0] = videoTime[0];
				// 	}
				// 	if(videoTime[1] < 10){
				// 		videoTime[1] = "0"+videoTime[1];
				// 	}else{
				// 		videoTime[1] = videoTime[1];
				// 	}
				// 	return videoTime = videoTime[0] +":"+ videoTime[1];
				// }
				// else if(videoTime.length===1){
				// 	if(videoTime[0] < 10){
				// 		videoTime[0] = "0:0"+videoTime[0];
				// 	}else{
				// 		videoTime[0] = videoTime[0];
				// 	}
				// 	return videoTime = videoTime[0] ;
				// }
			},
			URL(){
				return this.youtubeLink+this.id;
			},
			closeView(){
				this.videoPlay = false;
			},
			setPage(page){
				if(page < 1 || page > this.totalPage){
					return;
				}
				this.currentPage = page;
			}
		}
	}).mount('#app');