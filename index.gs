const play_list_id = "PLnD3JG_5-KED5ZPdlx9j-JrnRJHkA-qx2";
const remove_limit = 20;//days

/**
 * データを検証した数
 */
let get_cmplete = 0;

/**
 * 動画のリスト
 */
let get_item_list = {};

function get_play_list(page_token = null){
  console.log("プレイリストの取得開始")
  let play_list_content = YouTube.PlaylistItems.list("snippet",{playlistId:play_list_id,maxResults:50,pageToken:page_token});

  play_list_content.items.forEach(info => {
    if(get_item_list[info.snippet.resourceId.videoId]){
      YouTube.PlaylistItems.remove(info.id)
      console.log("重複した動画を削除しました。");
      
    }else{
      get_item_list[info.snippet.resourceId.videoId] = info;
    };
    
  })

  get_cmplete = get_cmplete + play_list_content.items.length

  console.log(play_list_content.pageInfo.totalResults)
  console.log(play_list_content.pageInfo.resultsPerPage)

  if(play_list_content.nextPageToken){
    console.log("nextPageTokenあり");
    get_play_list(play_list_content.nextPageToken);
  }else{
    console.log("nextPageTokenなし");
    
    Object.keys(get_item_list).forEach(item_name => {
      remove_playList(get_item_list[item_name]);
    });

    shuffle();

  }


}

function shuffle(){
    let list_array = Object.keys(get_item_list);
    let i = list_array.length;
    
    /**
     * 配列をシャッフル
     */
    while (i) {
    var j = Math.floor( Math.random() * i );
    var t = list_array[--i];
    list_array[i] = list_array[j];
    list_array[j] = t;
    }

    list_array.forEach(function(video_id,index,array){
      var video_obj = get_item_list[video_id];
      new Promise(() => {
        YouTube.PlaylistItems.update({
          
          id:video_obj.id,
          snippet:{
            playlistId:play_list_id,
            resourceId:video_obj.snippet.resourceId,
            position:index
          },
        },
          "snippet"
        ,{
          position:index
        });
        console.log("順番" + index + "に設定");
        });
    });
};

function remove_playList(item_info){
  //console.log(item_info.snippet.publishedAt)
  var add_date = item_info.snippet.publishedAt.slice(0,10).split("-");
  //console.log(add_date)
  var add_date = new Date(add_date[0],add_date[1] - 1,add_date[2]);
  //console.log(add_date);
  let now_date = new Date();

  let limit = 86400000 * remove_limit;

  let now_add = now_date.getTime() - add_date.getTime();
  //console.log(now_add);

  if(now_add > limit){
    console.log("now_add:" + now_add + " " + " limit:" + limit + " により " + item_info.id + " は削除対象");
    YouTube.PlaylistItems.remove(item_info.id);
    console.log("削除済み");
  }else{
    console.log("now_add:" + now_add + " " + " limit:" + limit + " により " + item_info.id + " は何もしない");
  };
}

function myFunction(){
  get_play_list()
}
