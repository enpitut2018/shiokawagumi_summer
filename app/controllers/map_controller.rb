class MapController < ApplicationController
  def home
  	# サンプル
  	@latitude = '35.6585805'
	@longitude = '139.7454329'
	@address = '〒105-0011 東京都港区芝公園４丁目２-８'

	@api_key = "https://maps.googleapis.com/maps/api/js?v=3.exp&key=" + ENV['GM_API_KEY'] +"&callback=initMap"
  end
end
