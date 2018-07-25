class TopController < ApplicationController
	require "twitter"
	def index
		@client = Twitter::REST::Client.new do |config|
			config.consumer_key        = ENV['TW_CONSUMER_KEY']
			config.consumer_secret     = ENV['TW_CONSUMER_SECRET']
			config.access_token        = ENV['TW_ACCESS_TOKEN']
			config.access_token_secret = ENV['TW_ACCESS_TOKEN_SECRET']
		end

		# 変数
		limit   = 100       # 取得するツイートの上限数
		keyword = "夏"   # ハッシュタグによる検索を行う際のキーワード

		# キーワードを含むハッシュタグの検索
		begin
			# limitで指定された数だけツイートを取得
			@tweets = @client.search("#{keyword} -rt", :locale => "ja", :result_type => "recent", :include_entity => true).take(limit)

			# 検索ワードでツイートを取得できなかった場合の例外処理
		rescue Twitter::Error::ClientError
			puts "ツイートを取得できませんでした"

			# リクエストが多すぎる場合の例外処理
		rescue Twitter::Error::TooManyRequests => error
			sleep error.rate_limit.reset_in
			retry
		end
	end
end
