import { supabase } from './supabase';

export interface ReviewReport {
  id: string;
  review_id: string;
  reported_by: string;
  report_reason: string;
  report_category: string;
  additional_details?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  resolution_notes?: string;
}

export interface CreateReportInput {
  review_id: string;
  reported_by: string;
  report_reason: string;
  report_category: string;
  additional_details?: string;
}

export interface ReportDashboardItem {
  report_id: string;
  review_id: string;
  report_reason: string;
  report_category: string;
  status: string;
  reported_at: string;
  additional_details?: string;
  review_comment: string;
  review_rating: number;
  reviewer_name: string;
  review_created_at: string;
  place_name: string;
  place_owner_id: string;
  reporter_name: string;
  reporter_id: string;
}

export class ReviewReportsService {
  /**
   * Report a review for inappropriate content
   */
  static async reportReview(reportData: CreateReportInput): Promise<ReviewReport> {
    try {
      console.log('🚨 Creating review report:', reportData);

      const { data, error } = await supabase
        .from('review_reports')
        .insert([{
          review_id: reportData.review_id,
          reported_by: reportData.reported_by,
          report_reason: reportData.report_reason,
          report_category: reportData.report_category,
          additional_details: reportData.additional_details,
          status: 'pending'
        }])
        .select('*')
        .single();

      if (error) {
        console.error('❌ Error creating report:', error);
        throw error;
      }

      console.log('✅ Report created successfully:', data.id);
      return data as ReviewReport;

    } catch (error) {
      console.error('❌ Error in reportReview:', error);
      throw error;
    }
  }

  /**
   * Get all reports for a specific host (for their places)
   */
  static async getHostReports(hostUserId: string): Promise<ReportDashboardItem[]> {
    try {
      console.log('📊 Getting reports for host:', hostUserId);

      // First try the dashboard view, if it fails, use the base tables
      let { data, error } = await supabase
        .from('review_reports_dashboard')
        .select('*')
        .eq('place_owner_id', hostUserId)
        .order('reported_at', { ascending: false });

      // If the view doesn't exist, fall back to joining tables manually
      if (error && error.message?.includes('review_reports_dashboard')) {
        console.log('📊 Dashboard view not found, using base tables...');
        
        const { data: reportsData, error: joinError } = await supabase
          .from('review_reports')
          .select(`
            id,
            review_id,
            report_reason,
            report_category,
            status,
            created_at,
            additional_details,
            reported_by,
            reviews!inner(
              id,
              comment,
              rating,
              reviewer_name,
              created_at,
              place_id,
              places!inner(
                id,
                title,
                owner_id
              )
            )
          `)
          .eq('reviews.places.owner_id', hostUserId)
          .order('created_at', { ascending: false });

        if (joinError) {
          console.error('❌ Error getting host reports with join:', joinError);
          throw joinError;
        }

        // Transform the data to match the expected format
        data = reportsData?.map(report => ({
          report_id: report.id,
          review_id: report.review_id,
          report_reason: report.report_reason,
          report_category: report.report_category,
          status: report.status,
          reported_at: report.created_at,
          additional_details: report.additional_details,
          review_comment: report.reviews?.comment || '',
          review_rating: report.reviews?.rating || 0,
          reviewer_name: report.reviews?.reviewer_name || 'Unknown',
          review_created_at: report.reviews?.created_at || '',
          place_name: report.reviews?.places?.title || 'Unknown Place',
          place_owner_id: report.reviews?.places?.owner_id || '',
          reporter_name: 'Unknown Reporter', // No user_profiles table available
          reporter_id: report.reported_by
        })) || [];
      } else if (error) {
        console.error('❌ Error getting host reports:', error);
        throw error;
      }

      console.log(`✅ Retrieved ${data?.length || 0} reports for host`);
      return data as ReportDashboardItem[] || [];

    } catch (error) {
      console.error('❌ Error in getHostReports:', error);
      return [];
    }
  }

  /**
   * Get all reports (for admin dashboard)
   */
  static async getAllReports(limit: number = 100): Promise<ReportDashboardItem[]> {
    try {
      console.log('📊 Getting all reports');

      // First try the dashboard view, if it fails, use the base tables
      let { data, error } = await supabase
        .from('review_reports_dashboard')
        .select('*')
        .order('reported_at', { ascending: false })
        .limit(limit);

      // If the view doesn't exist, fall back to joining tables manually
      if (error && error.message?.includes('review_reports_dashboard')) {
        console.log('📊 Dashboard view not found, using base tables...');
        
        const { data: reportsData, error: joinError } = await supabase
          .from('review_reports')
          .select(`
            id,
            review_id,
            report_reason,
            report_category,
            status,
            created_at,
            additional_details,
            reported_by,
            reviews!inner(
              id,
              comment,
              rating,
              reviewer_name,
              created_at,
              place_id,
              places!inner(
                id,
                title,
                owner_id
              )
            )
          `)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (joinError) {
          console.error('❌ Error getting all reports with join:', joinError);
          throw joinError;
        }

        // Transform the data to match the expected format
        data = reportsData?.map(report => ({
          report_id: report.id,
          review_id: report.review_id,
          report_reason: report.report_reason,
          report_category: report.report_category,
          status: report.status,
          reported_at: report.created_at,
          additional_details: report.additional_details,
          review_comment: report.reviews?.comment || '',
          review_rating: report.reviews?.rating || 0,
          reviewer_name: report.reviews?.reviewer_name || 'Unknown',
          review_created_at: report.reviews?.created_at || '',
          place_name: report.reviews?.places?.title || 'Unknown Place',
          place_owner_id: report.reviews?.places?.owner_id || '',
          reporter_name: 'Unknown Reporter', // No user_profiles table available
          reporter_id: report.reported_by
        })) || [];
      } else if (error) {
        console.error('❌ Error getting all reports:', error);
        throw error;
      }

      console.log(`✅ Retrieved ${data?.length || 0} total reports`);
      return data as ReportDashboardItem[] || [];

    } catch (error) {
      console.error('❌ Error in getAllReports:', error);
      return [];
    }
  }

  /**
   * Update report status (for moderators/admins)
   */
  static async updateReportStatus(
    reportId: string,
    status: 'reviewed' | 'resolved' | 'dismissed',
    reviewedBy: string,
    resolutionNotes?: string
  ): Promise<void> {
    try {
      console.log('📝 Updating report status:', reportId, status);

      const { error } = await supabase
        .from('review_reports')
        .update({
          status: status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewedBy,
          resolution_notes: resolutionNotes
        })
        .eq('id', reportId);

      if (error) {
        console.error('❌ Error updating report status:', error);
        throw error;
      }

      console.log('✅ Report status updated successfully');

    } catch (error) {
      console.error('❌ Error in updateReportStatus:', error);
      throw error;
    }
  }

  /**
   * Check if user has already reported a specific review
   */
  static async hasUserReportedReview(reviewId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('review_reports')
        .select('id')
        .eq('review_id', reviewId)
        .eq('reported_by', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error checking existing report:', error);
        return false;
      }

      return !!data;

    } catch (error) {
      console.error('❌ Error in hasUserReportedReview:', error);
      return false;
    }
  }

  /**
   * Get report statistics for a host
   */
  static async getHostReportStats(hostUserId: string): Promise<{
    totalReports: number;
    pendingReports: number;
    resolvedReports: number;
    dismissedReports: number;
  }> {
    try {
      console.log('📊 Getting report stats for host:', hostUserId);

      // First try the dashboard view, if it fails, use the base tables
      let { data, error } = await supabase
        .from('review_reports_dashboard')
        .select('status')
        .eq('place_owner_id', hostUserId);

      // If the view doesn't exist, fall back to joining tables manually
      if (error && error.message?.includes('review_reports_dashboard')) {
        console.log('📊 Dashboard view not found, using base tables for stats...');
        
        const { data: reportsData, error: joinError } = await supabase
          .from('review_reports')
          .select(`
            status,
            reviews!inner(
              place_id,
              places!inner(
                owner_id
              )
            )
          `)
          .eq('reviews.places.owner_id', hostUserId);

        if (joinError) {
          console.error('❌ Error getting report stats with join:', joinError);
          return { totalReports: 0, pendingReports: 0, resolvedReports: 0, dismissedReports: 0 };
        }

        data = reportsData?.map(report => ({ status: report.status })) || [];
      } else if (error) {
        console.error('❌ Error getting report stats:', error);
        return { totalReports: 0, pendingReports: 0, resolvedReports: 0, dismissedReports: 0 };
      }

      const stats = {
        totalReports: data?.length || 0,
        pendingReports: data?.filter(r => r.status === 'pending').length || 0,
        resolvedReports: data?.filter(r => r.status === 'resolved').length || 0,
        dismissedReports: data?.filter(r => r.status === 'dismissed').length || 0,
      };

      console.log('✅ Report stats retrieved:', stats);
      return stats;

    } catch (error) {
      console.error('❌ Error in getHostReportStats:', error);
      return { totalReports: 0, pendingReports: 0, resolvedReports: 0, dismissedReports: 0 };
    }
  }

  /**
   * Get predefined report categories
   */
  static getReportCategories(): Array<{ key: string; label: string; description: string }> {
    return [
      {
        key: 'spam',
        label: 'Spam',
        description: 'Promotional content or repetitive messages'
      },
      {
        key: 'abuse',
        label: 'Abusive Language',
        description: 'Offensive, threatening, or inappropriate language'
      },
      {
        key: 'harassment',
        label: 'Harassment',
        description: 'Targeting or bullying behavior'
      },
      {
        key: 'fake',
        label: 'Fake Review',
        description: 'Suspicious or fabricated review'
      },
      {
        key: 'inappropriate',
        label: 'Inappropriate Content',
        description: 'Content not suitable for the platform'
      },
      {
        key: 'off-topic',
        label: 'Off-Topic',
        description: 'Review not related to the place'
      },
      {
        key: 'other',
        label: 'Other',
        description: 'Other reason not listed above'
      }
    ];
  }

  /**
   * Test database connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing review reports table connection...');

      const { data, error } = await supabase
        .from('review_reports')
        .select('id')
        .limit(1);

      if (error) {
        console.error('❌ Review reports table connection failed:', error);
        
        // Check if it's a missing table error
        if (error.message?.includes('relation "review_reports" does not exist') || 
            error.message?.includes('table "review_reports" does not exist')) {
          console.log('💡 Review reports table does not exist. Please run ADAPTIVE_REVIEW_REPORTS_FIX.sql');
          return false;
        }
        
        return false;
      }

      console.log('✅ Review reports table connection successful');
      return true;

    } catch (error) {
      console.error('❌ Error testing review reports connection:', error);
      return false;
    }
  }
}