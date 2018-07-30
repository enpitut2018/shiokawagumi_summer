class MapController < ApplicationController
	require "twitter"
	def home
		@client = Twitter::REST::Client.new do |config|
			config.consumer_key        = ENV['TW_CONSUMER_KEY']
			config.consumer_secret     = ENV['TW_CONSUMER_SECRET']
			config.access_token        = ENV['TW_ACCESS_TOKEN']
			config.access_token_secret = ENV['TW_ACCESS_TOKEN_SECRET']
		end

		# 変数
		limit_minnano = 100       # 取得するツイートの上限数
		limit_random = 50 
		# ハッシュタグによる検索を行う際のキーワードはこれ
		keyword_minnano = "#みんなの夏休み filter:images filter:place_id"

		keyword_random = "海 OR かき氷 OR ひまわり OR 花火 OR 夏祭り OR アイス filter:images filter:place_id" 
		# キーワードを含むハッシュタグの検索
		begin
			# limitで指定された数だけツイートを取得
			@tweets_minnano = @client.search("#{keyword_minnano} -rt", :locale => "ja", :result_type => "recent", :include_entity => true).take(limit_minnano)

			@tweets_random = @client.search("#{keyword_random} -rt", :locale => "ja", :result_type => "recent", :include_entity => true).take(limit_random)


			# 検索ワードでツイートを取得できなかった場合の例外処理
		rescue Twitter::Error::ClientError
			puts "ツイートを取得できませんでした"

			# リクエストが多すぎる場合の例外処理
		rescue Twitter::Error::TooManyRequests => error
			sleep error.rate_limit.reset_in
			retry
		end

		@api_key = "https://maps.googleapis.com/maps/api/js?v=3.exp&key=" + ENV['GM_API_KEY'] + "&callback=initMap"

		if request.post?
			@place = params['place']
		end
	end

	def static_page
		@api_key = "https://maps.googleapis.com/maps/api/js?v=3.exp&key=" + ENV['GM_API_KEY']
	end
end
