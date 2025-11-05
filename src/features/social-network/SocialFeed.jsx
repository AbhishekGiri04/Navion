import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaTimes, 
  FaUsers, 
  FaHeart, 
  FaComment, 
  FaShare, 
  FaCamera,
  FaStar,
  FaMapMarkerAlt,
  FaUserFriends
} from 'react-icons/fa'

const SocialLayer = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('feed')
  const [newPost, setNewPost] = useState('')

  const socialPosts = [
    {
      id: 1,
      user: { name: 'Alex Chen', avatar: '/avatars/alex.jpg' },
      location: 'Golden Gate Bridge, SF',
      coordinates: { lat: 37.8199, lng: -122.4783 },
      text: 'Amazing sunset view from the bridge! Perfect spot for photos 📸',
      image: '/posts/golden-gate.jpg',
      likes: 24,
      comments: 8,
      timestamp: '2 hours ago',
      type: 'photo'
    },
    {
      id: 2,
      user: { name: 'Sarah Kim', avatar: '/avatars/sarah.jpg' },
      location: 'Blue Bottle Coffee, Mission',
      coordinates: { lat: 37.7599, lng: -122.4148 },
      text: 'Hidden gem! Best coffee in the Mission district ☕',
      rating: 5,
      likes: 12,
      comments: 3,
      timestamp: '4 hours ago',
      type: 'review'
    },
    {
      id: 3,
      user: { name: 'Mike Rodriguez', avatar: '/avatars/mike.jpg' },
      location: 'Lombard Street',
      coordinates: { lat: 37.8021, lng: -122.4187 },
      text: 'Traffic alert: Construction on Lombard St. Use alternate route!',
      likes: 45,
      comments: 12,
      timestamp: '1 hour ago',
      type: 'alert'
    }
  ]

  const friends = [
    { id: 1, name: 'Emma Wilson', status: 'At Pier 39', distance: '0.5 mi', online: true },
    { id: 2, name: 'David Park', status: 'Driving to Oakland', distance: '2.1 mi', online: true },
    { id: 3, name: 'Lisa Zhang', status: 'Offline', distance: '5.2 mi', online: false },
  ]

  const tabs = [
    { id: 'feed', label: 'Feed', icon: <FaUsers /> },
    { id: 'friends', label: 'Friends', icon: <FaUserFriends /> },
    { id: 'create', label: 'Create', icon: <FaCamera /> }
  ]

  const handleLike = (postId) => {
    console.log('Liked post:', postId)
  }

  const handleShare = (post) => {
    console.log('Sharing post:', post)
  }

  const renderFeed = () => (
    <div className="space-y-4">
      {socialPosts.map((post) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border p-4"
        >
          {/* Post Header */}
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-nova-blue to-nova-purple rounded-full flex items-center justify-center text-white font-semibold">
              {post.user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-nova-dark">{post.user.name}</h4>
              <div className="flex items-center space-x-1 text-sm text-nova-gray">
                <FaMapMarkerAlt className="text-xs" />
                <span>{post.location}</span>
                <span>•</span>
                <span>{post.timestamp}</span>
              </div>
            </div>
            {post.type === 'alert' && (
              <div className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                Alert
              </div>
            )}
          </div>

          {/* Post Content */}
          <p className="text-nova-dark mb-3">{post.text}</p>

          {/* Rating for reviews */}
          {post.type === 'review' && (
            <div className="flex items-center space-x-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`text-sm ${
                    i < post.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-sm text-nova-gray ml-2">({post.rating}/5)</span>
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLike(post.id)}
                className="flex items-center space-x-1 text-nova-gray hover:text-red-500 transition-colors"
              >
                <FaHeart />
                <span className="text-sm">{post.likes}</span>
              </motion.button>
              
              <button className="flex items-center space-x-1 text-nova-gray hover:text-nova-blue transition-colors">
                <FaComment />
                <span className="text-sm">{post.comments}</span>
              </button>
            </div>
            
            <button
              onClick={() => handleShare(post)}
              className="text-nova-gray hover:text-nova-blue transition-colors"
            >
              <FaShare />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  )

  const renderFriends = () => (
    <div className="space-y-3">
      {friends.map((friend) => (
        <motion.div
          key={friend.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm border"
        >
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-nova-purple to-nova-blue rounded-full flex items-center justify-center text-white font-semibold">
              {friend.name.charAt(0)}
            </div>
            {friend.online && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-nova-dark">{friend.name}</h4>
            <p className="text-sm text-nova-gray">{friend.status}</p>
            <p className="text-xs text-nova-gray">{friend.distance} away</p>
          </div>
          
          <button className="nova-button-secondary text-sm px-3 py-1">
            Locate
          </button>
        </motion.div>
      ))}
    </div>
  )

  const renderCreate = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="font-semibold text-nova-dark mb-3">Share Your Experience</h3>
        
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's interesting about this location?"
          className="w-full nova-input resize-none h-24 mb-3"
        />
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button className="flex items-center space-x-1 text-nova-gray hover:text-nova-blue transition-colors">
              <FaCamera />
              <span className="text-sm">Photo</span>
            </button>
            <button className="flex items-center space-x-1 text-nova-gray hover:text-nova-blue transition-colors">
              <FaStar />
              <span className="text-sm">Rate</span>
            </button>
          </div>
          
          <button className="nova-button-primary">
            Share
          </button>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="bg-white rounded-lg shadow-sm border p-4 text-center hover:bg-gray-50 transition-colors">
          <FaMapMarkerAlt className="text-nova-blue text-xl mx-auto mb-2" />
          <span className="text-sm font-medium">Mark Hidden Gem</span>
        </button>
        
        <button className="bg-white rounded-lg shadow-sm border p-4 text-center hover:bg-gray-50 transition-colors">
          <FaUsers className="text-nova-purple text-xl mx-auto mb-2" />
          <span className="text-sm font-medium">Create Trip</span>
        </button>
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed top-0 right-0 w-96 h-full bg-nova-light shadow-2xl z-40 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <h2 className="text-xl font-bold text-nova-dark">Social Layer</h2>
        <button
          onClick={onClose}
          className="text-nova-gray hover:text-nova-dark transition-colors"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 transition-colors ${
              activeTab === tab.id
                ? 'text-nova-blue border-b-2 border-nova-blue'
                : 'text-nova-gray hover:text-nova-dark'
            }`}
          >
            {tab.icon}
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'feed' && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderFeed()}
            </motion.div>
          )}
          
          {activeTab === 'friends' && (
            <motion.div
              key="friends"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderFriends()}
            </motion.div>
          )}
          
          {activeTab === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderCreate()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default SocialLayer