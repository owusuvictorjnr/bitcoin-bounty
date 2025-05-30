import Link from 'next/link';
import { Bounty } from '@/types';
import { formatDistanceToNowStrict } from 'date-fns';
import { Tag, Clock, Award, Briefcase, ExternalLink } from 'lucide-react';

interface BountyCardProps {
  bounty: Bounty;
}

export default function BountyCard({ bounty }: BountyCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-semibold text-blue-600 mb-2">{bounty.title}</h2>
        <div className="text-sm text-gray-500 mb-1 flex items-center">
          <Briefcase size={14} className="mr-1.5" />
          <span>{bounty.companyName || 'A Company'}</span>
        </div>
        <div className="text-sm text-yellow-600 mb-3 font-medium flex items-center">
          <Award size={14} className="mr-1.5" />
          <span>{bounty.bountyAmountBTC} BTC</span>
        </div>
        <p className="text-gray-700 text-sm mb-3 line-clamp-3">{bounty.description}</p>
        {bounty.skills && bounty.skills.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {bounty.skills.slice(0, 5).map(skill => (
              <span key={skill} className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full flex items-center">
                <Tag size={12} className="mr-1" /> {skill}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
         <div className="text-xs text-gray-500 mb-3 flex items-center justify-between">
            <span className="flex items-center"><Clock size={12} className="mr-1"/> Posted {formatDistanceToNowStrict(bounty.createdAt.toDate())} ago</span>
            {bounty.deadline && (
                <span className="flex items-center"><Clock size={12} className="mr-1 text-red-500"/> Deadline: {formatDistanceToNowStrict(bounty.deadline.toDate())}</span>
            )}
        </div>
        <Link
          href={`/bounties/${bounty.id}`}
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          View Details <ExternalLink size={16} className="ml-2"/>
        </Link>
      </div>
    </div>
  );
}